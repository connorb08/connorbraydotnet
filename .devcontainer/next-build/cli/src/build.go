package ocie

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"slices"

	"github.com/BurntSushi/toml"
	"github.com/google/go-containerregistry/pkg/authn"
	"github.com/google/go-containerregistry/pkg/name"
	"github.com/google/go-containerregistry/pkg/v1/layout"
	"github.com/google/go-containerregistry/pkg/v1/remote"
)

// Layout directories under <buildx dir>/build that the workflow produces.
const (
	baseLayout    = "base-layered-oci" // bake target "base"
	toolsLayout   = "tool-builder-oci" // bake target "tool-builder"
	miseLayout    = "mise-oci"         // bake target "final"
	squashedBase  = "squashed-base"    // Flatten(base)
	devenvLayout  = "devenv-oci"       // Merge(squashed base, mise)
	miseConfigDir = ".."               // MISE_CONFIG_DIR default in vars.hcl
)

// AllTarget selects every build target; it is the default.
const AllTarget = "all"

// BuildTarget is one step of the build workflow.
type BuildTarget struct {
	Name    string
	Summary string
	// Needs lists the targets whose outputs this one reads.
	Needs []string
	// Output is the OCI layout the target writes, under <Dir>/build.
	Output string

	bake  string // bake target that produces Output, if baked
	cache string // bake target whose cache export covers this step
	run   func(opts BuildOptions, path func(string) string) (tag string, err error)
}

// BuildTargets lists the build targets in dependency order.
var BuildTargets = []BuildTarget{
	{
		Name:    "base",
		Summary: "bake the layered runtime base image",
		Output:  baseLayout,
		bake:    "base",
		cache:   "base",
	},
	{
		Name:    "squash",
		Summary: "flatten the base image into a single layer",
		Needs:   []string{"base"},
		Output:  squashedBase,
		run: func(_ BuildOptions, path func(string) string) (string, error) {
			tag, err := layoutTag(path(baseLayout))
			if err != nil {
				return "", fmt.Errorf("read base tag: %w", err)
			}
			if err := Flatten(path(baseLayout), path(squashedBase), tag); err != nil {
				return "", fmt.Errorf("flatten base: %w", err)
			}
			return tag, nil
		},
	},
	{
		Name:    "tools",
		Summary: "bake the tool-builder image with every mise tool installed",
		Output:  toolsLayout,
		bake:    "tool-builder",
		cache:   "tool-builder",
	},
	{
		Name:    "final",
		Summary: "bake the mise-built tool image",
		Output:  miseLayout,
		bake:    "final",
		cache:   "tool-builder", // final itself is never cached
	},
	{
		Name:    "devenv",
		Summary: "merge the tool layers onto the flattened base",
		Needs:   []string{"squash", "final"},
		Output:  devenvLayout,
		run: func(_ BuildOptions, path func(string) string) (string, error) {
			tag, err := layoutTag(path(squashedBase))
			if err != nil {
				return "", fmt.Errorf("read squashed base tag: %w", err)
			}
			if err := Merge(path(squashedBase), path(miseLayout), path(devenvLayout), tag); err != nil {
				return "", fmt.Errorf("merge tools onto base: %w", err)
			}
			return tag, nil
		},
	},
}

// allTargets is what AllTarget expands to (before dependencies).
var allTargets = []string{"devenv", "tools"}

// BuildOptions configures Build.
type BuildOptions struct {
	// Dir is the buildx directory holding the bake files and Dockerfiles.
	Dir string
	// ToolsFile is the tools.toml whose [tools] keys become TOOL_LIST.
	// Defaults to <Dir>/../tools.toml.
	ToolsFile string
	// Registry overrides the REGISTRY bake variable when non-empty.
	Registry string
	// Targets selects the BuildTargets to run; empty means AllTarget.
	Targets []string
	// NoDeps runs only the selected targets, reusing existing outputs of the
	// targets they need instead of rebuilding them.
	NoDeps bool
	// Print prints the resolved bake definition instead of building.
	Print bool
	// Push uploads build/devenv-oci to the final bake target's tag once the
	// selected targets are built.
	Push bool
	// WriteCache exports the build cache of the baked targets to the
	// registry once everything else has succeeded.
	WriteCache bool

	Stdout, Stderr io.Writer
	// Exec runs external commands; defaults to (*exec.Cmd).Run.
	Exec func(*exec.Cmd) error
}

// BuildResult reports what Build produced.
type BuildResult struct {
	// Outputs are the OCI layouts written, in build order.
	Outputs []string
	// Tag is the image tag carried by squash/devenv, when either ran.
	Tag string
	// Pushed is the reference pushed, when Push was set.
	Pushed string
}

// Build runs the selected targets in dependency order, baking consecutive
// bake targets in a single invocation, then optionally pushes the devenv
// image (Push) and exports the build cache (WriteCache).
func Build(opts BuildOptions) (BuildResult, error) {
	var result BuildResult
	opts = opts.withDefaults()
	plan, err := planBuild(opts.Targets, opts.NoDeps)
	if err != nil {
		return result, err
	}
	tools, err := readToolList(opts.ToolsFile)
	if err != nil {
		return result, err
	}
	var bakeTargets, cacheTargets []string
	for _, target := range plan {
		if target.bake != "" {
			bakeTargets = append(bakeTargets, target.bake)
		}
		if target.cache != "" && !slices.Contains(cacheTargets, target.cache) {
			cacheTargets = append(cacheTargets, target.cache)
		}
	}
	if opts.Print {
		if len(bakeTargets) == 0 {
			return result, errors.New("selected targets are not baked; nothing to print")
		}
		return result, opts.bake(tools, bakeRun{}, append([]string{"--print"}, bakeTargets...)...)
	}

	path := func(name string) string { return filepath.Join(opts.Dir, "build", name) }
	// Bake adds to an existing OCI layout instead of replacing it, and
	// Flatten/Merge refuse to overwrite, so start each output fresh.
	for _, target := range plan {
		if err := os.RemoveAll(path(target.Output)); err != nil {
			return result, fmt.Errorf("clean %s: %w", target.Output, err)
		}
	}
	var pending []BuildTarget
	flush := func() error {
		if len(pending) == 0 {
			return nil
		}
		var names []string
		for _, target := range pending {
			names = append(names, target.bake)
		}
		if err := opts.bake(tools, bakeRun{}, names...); err != nil {
			return err
		}
		for _, target := range pending {
			result.Outputs = append(result.Outputs, path(target.Output))
		}
		pending = nil
		return nil
	}
	for _, target := range plan {
		if target.bake != "" {
			pending = append(pending, target)
			continue
		}
		if err := flush(); err != nil {
			return result, err
		}
		tag, err := target.run(opts, path)
		if err != nil {
			return result, fmt.Errorf("%s: %w", target.Name, err)
		}
		result.Tag = tag
		result.Outputs = append(result.Outputs, path(target.Output))
	}
	if err := flush(); err != nil {
		return result, err
	}

	if opts.Push {
		if result.Pushed, err = opts.push(tools, path(devenvLayout), ""); err != nil {
			return result, err
		}
	}
	if opts.WriteCache && len(cacheTargets) > 0 {
		if err := opts.writeCache(tools, cacheTargets...); err != nil {
			return result, err
		}
	}
	return result, nil
}

// planBuild expands the requested target names (and, unless noDeps, the
// targets they need) into BuildTargets in dependency order.
func planBuild(names []string, noDeps bool) ([]BuildTarget, error) {
	if len(names) == 0 {
		names = []string{AllTarget}
	}
	selected := map[string]bool{}
	var visit func(name string) error
	visit = func(name string) error {
		if name == AllTarget {
			for _, name := range allTargets {
				if err := visit(name); err != nil {
					return err
				}
			}
			return nil
		}
		index := slices.IndexFunc(BuildTargets, func(t BuildTarget) bool { return t.Name == name })
		if index < 0 {
			return fmt.Errorf("unknown build target %q", name)
		}
		if selected[name] {
			return nil
		}
		selected[name] = true
		if !noDeps {
			for _, need := range BuildTargets[index].Needs {
				if err := visit(need); err != nil {
					return err
				}
			}
		}
		return nil
	}
	for _, name := range names {
		if err := visit(name); err != nil {
			return nil, err
		}
	}
	var plan []BuildTarget
	for _, target := range BuildTargets {
		if selected[target.Name] {
			plan = append(plan, target)
		}
	}
	return plan, nil
}

// PushBuilt uploads an already built layout (default <Dir>/build/devenv-oci)
// to image, or to the final bake target's tag when image is empty. It
// returns the reference pushed.
func PushBuilt(opts BuildOptions, layoutPath, image string) (string, error) {
	opts = opts.withDefaults()
	if layoutPath == "" {
		layoutPath = filepath.Join(opts.Dir, "build", devenvLayout)
	}
	var tools []string
	if image == "" {
		var err error
		if tools, err = readToolList(opts.ToolsFile); err != nil {
			return "", err
		}
	}
	return opts.push(tools, layoutPath, image)
}

// WriteCache re-bakes the cached targets with WRITE_CACHE=true and every
// output discarded, exporting their build cache to the registry. After a
// build everything is cached locally, so this only uploads cache.
func WriteCache(opts BuildOptions) error {
	opts = opts.withDefaults()
	tools, err := readToolList(opts.ToolsFile)
	if err != nil {
		return err
	}
	return opts.writeCache(tools, "base", "tool-builder")
}

func (opts BuildOptions) writeCache(tools []string, targets ...string) error {
	args := append([]string{"--set", "*.output=type=cacheonly"}, targets...)
	err := opts.bake(tools, bakeRun{writeCache: true}, args...)
	if err != nil {
		return fmt.Errorf("write cache: %w", err)
	}
	return nil
}

func (opts BuildOptions) push(tools []string, layoutPath, image string) (string, error) {
	if image == "" {
		var err error
		if image, err = opts.pushTarget(tools); err != nil {
			return "", err
		}
	}
	if err := Push(layoutPath, image); err != nil {
		return "", err
	}
	fmt.Fprintf(opts.Stderr, "Pushed %s\n", image)
	return image, nil
}

// pushTarget resolves the push destination from the final bake target's
// tag, so the registry, repository and tag stay defined only in the bake files.
func (opts BuildOptions) pushTarget(tools []string) (string, error) {
	var definition bytes.Buffer
	if err := opts.bake(tools, bakeRun{stdout: &definition}, "--print", "final"); err != nil {
		return "", err
	}
	var printed struct {
		Target map[string]struct {
			Tags []string `json:"tags"`
		} `json:"target"`
	}
	if err := json.Unmarshal(definition.Bytes(), &printed); err != nil {
		return "", fmt.Errorf("parse bake definition: %w", err)
	}
	tags := printed.Target["final"].Tags
	if len(tags) != 1 {
		return "", fmt.Errorf("final bake target has %d tags, want 1 push destination", len(tags))
	}
	return tags[0], nil
}

// Push uploads the single image in an OCI layout to image, authenticating
// with the local Docker credentials (including credential helpers).
func Push(layoutPath, image string) error {
	ref, err := name.ParseReference(image)
	if err != nil {
		return fmt.Errorf("parse image reference: %w", err)
	}
	img, _, err := ReadLayoutImage(layoutPath, "")
	if err != nil {
		return fmt.Errorf("read %s: %w", layoutPath, err)
	}
	if err := remote.Write(ref, img, remote.WithAuthFromKeychain(authn.DefaultKeychain)); err != nil {
		return fmt.Errorf("push %s: %w", image, err)
	}
	return nil
}

func (opts BuildOptions) withDefaults() BuildOptions {
	if opts.ToolsFile == "" {
		opts.ToolsFile = filepath.Join(opts.Dir, miseConfigDir, "tools.toml")
	}
	if opts.Stdout == nil {
		opts.Stdout = os.Stdout
	}
	if opts.Stderr == nil {
		opts.Stderr = os.Stderr
	}
	if opts.Exec == nil {
		opts.Exec = (*exec.Cmd).Run
	}
	return opts
}

// bakeRun adjusts a single bake invocation.
type bakeRun struct {
	writeCache bool      // set WRITE_CACHE=true instead of false
	stdout     io.Writer // capture stdout instead of Options.Stdout
}

// bake runs `docker buildx bake` in Dir with every *.hcl file loaded and
// TOOL_LIST supplied on stdin.
func (opts BuildOptions) bake(tools []string, run bakeRun, args ...string) error {
	files, err := filepath.Glob(filepath.Join(opts.Dir, "*.hcl"))
	if err != nil {
		return err
	}
	if len(files) == 0 {
		return fmt.Errorf("no bake files in %s", opts.Dir)
	}
	slices.Sort(files)
	command := []string{"buildx", "bake"}
	for _, file := range files {
		command = append(command, "-f", filepath.Base(file))
	}
	command = append(command, "-f", "-", "--allow", "fs.read="+miseConfigDir)
	command = append(command, args...)

	variables, err := json.Marshal(map[string]any{
		"variable": map[string]any{"TOOL_LIST": map[string]any{"default": tools}},
	})
	if err != nil {
		return err
	}
	cmd := exec.Command("docker", command...)
	cmd.Dir = opts.Dir
	cmd.Stdin = bytes.NewReader(variables)
	cmd.Stdout = opts.Stdout
	if run.stdout != nil {
		cmd.Stdout = run.stdout
	}
	cmd.Stderr = opts.Stderr
	// Set WRITE_CACHE explicitly so the caller's environment cannot turn
	// cache export on for ordinary builds.
	cmd.Env = append(os.Environ(), fmt.Sprintf("WRITE_CACHE=%t", run.writeCache))
	if opts.Registry != "" {
		cmd.Env = append(cmd.Env, "REGISTRY="+opts.Registry)
	}
	if err := opts.Exec(cmd); err != nil {
		return fmt.Errorf("docker %v: %w", args, err)
	}
	return nil
}

// readToolList returns the sorted [tools] keys of a mise tools.toml.
func readToolList(path string) ([]string, error) {
	var config struct {
		Tools map[string]toml.Primitive `toml:"tools"`
	}
	if _, err := toml.DecodeFile(path, &config); err != nil {
		return nil, fmt.Errorf("read tool list: %w", err)
	}
	if len(config.Tools) == 0 {
		return nil, fmt.Errorf("no tools configured in %s", path)
	}
	tools := make([]string, 0, len(config.Tools))
	for tool := range config.Tools {
		tools = append(tools, tool)
	}
	slices.Sort(tools)
	return tools, nil
}

// layoutTag returns the tag of the single image in an OCI layout.
func layoutTag(path string) (string, error) {
	index, err := layout.ImageIndexFromPath(path)
	if err != nil {
		return "", err
	}
	manifest, err := index.IndexManifest()
	if err != nil {
		return "", err
	}
	if len(manifest.Manifests) != 1 {
		return "", fmt.Errorf("%s holds %d images, want 1", path, len(manifest.Manifests))
	}
	tag := manifest.Manifests[0].Annotations[TagAnnotation]
	if tag == "" {
		return "", fmt.Errorf("%s image has no %s annotation", path, TagAnnotation)
	}
	return tag, nil
}

// FindBuildxDir locates the buildx directory: start itself, a buildx child of
// start or any parent, or the buildx sibling of the running executable's
// source tree.
func FindBuildxDir(start string) (string, error) {
	isBuildx := func(dir string) bool {
		_, err := os.Stat(filepath.Join(dir, "docker-bake.hcl"))
		_, err2 := os.Stat(filepath.Join(dir, "functions.hcl"))
		return err == nil && err2 == nil
	}
	search := func(dir string) string {
		for {
			for _, candidate := range []string{dir, filepath.Join(dir, "buildx")} {
				if isBuildx(candidate) {
					return candidate
				}
			}
			parent := filepath.Dir(dir)
			if parent == dir {
				return ""
			}
			dir = parent
		}
	}
	if dir := search(start); dir != "" {
		return dir, nil
	}
	if executable, err := os.Executable(); err == nil {
		if resolved, err := filepath.EvalSymlinks(executable); err == nil {
			if dir := search(filepath.Dir(resolved)); dir != "" {
				return dir, nil
			}
		}
	}
	return "", errors.New("buildx directory not found; pass -dir")
}
