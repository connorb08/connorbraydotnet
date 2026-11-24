package ocie_test

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http/httptest"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	ocie "connorbraydotnet/devcontainer/ocie/src"

	"github.com/google/go-containerregistry/pkg/name"
	"github.com/google/go-containerregistry/pkg/registry"
	v1 "github.com/google/go-containerregistry/pkg/v1"
	"github.com/google/go-containerregistry/pkg/v1/empty"
	"github.com/google/go-containerregistry/pkg/v1/layout"
	"github.com/google/go-containerregistry/pkg/v1/mutate"
	"github.com/google/go-containerregistry/pkg/v1/remote"
)

// buildTree lays out <root>/tools.toml and <root>/buildx/*.hcl and returns
// the buildx directory.
func buildTree(t *testing.T, tools string) string {
	t.Helper()
	root := t.TempDir()
	dir := filepath.Join(root, "buildx")
	for path, body := range map[string]string{
		filepath.Join(root, "tools.toml"):         tools,
		filepath.Join(dir, "docker-bake.hcl"):     "",
		filepath.Join(dir, "functions.hcl"):       "",
		filepath.Join(dir, "vars.hcl"):            "",
		filepath.Join(dir, "base.Dockerfile"):     "",
		filepath.Join(dir, "build", "stale.json"): "",
	} {
		if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(path, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	return dir
}

func writeTestLayout(t *testing.T, path string, image v1.Image, tag string) {
	t.Helper()
	destination, err := layout.Write(path, empty.Index)
	if err != nil {
		t.Fatal(err)
	}
	var options []layout.Option
	if tag != "" {
		options = append(options, layout.WithAnnotations(map[string]string{ocie.TagAnnotation: tag}))
	}
	if err := destination.AppendImage(image, options...); err != nil {
		t.Fatal(err)
	}
}

type bakeCall struct {
	args       []string
	dir        string
	registry   string
	writeCache string
	tools      []string
}

// pushImage is what the fake `bake --print final` reports as the final tag.
var pushImage string

// testRegistry starts an in-memory registry and returns its host.
func testRegistry(t *testing.T) string {
	t.Helper()
	server := httptest.NewServer(registry.New())
	t.Cleanup(server.Close)
	u, err := url.Parse(server.URL)
	if err != nil {
		t.Fatal(err)
	}
	return u.Host
}

// assertPushed checks that image in the registry matches the layout's image.
func assertPushed(t *testing.T, layoutPath, image string) {
	t.Helper()
	local, _, err := ocie.ReadLayoutImage(layoutPath, "")
	if err != nil {
		t.Fatal(err)
	}
	ref, err := name.ParseReference(image)
	if err != nil {
		t.Fatal(err)
	}
	remoteImage, err := remote.Image(ref)
	if err != nil {
		t.Fatalf("pulled %s: %v", image, err)
	}
	want, _ := local.Digest()
	got, _ := remoteImage.Digest()
	if got != want {
		t.Fatalf("pushed digest %s, want %s", got, want)
	}
}

func targets(call bakeCall) []string {
	return call.args[slices.Index(call.args, "fs.read=..")+1:]
}

// fakeDocker records bake invocations and writes the layouts the real bake
// targets would export.
func fakeDocker(t *testing.T, dir string, calls *[]bakeCall) func(*exec.Cmd) error {
	return func(cmd *exec.Cmd) error {
		var variables struct {
			Variable struct {
				ToolList struct {
					Default []string `json:"default"`
				} `json:"TOOL_LIST"`
			} `json:"variable"`
		}
		stdin, err := io.ReadAll(cmd.Stdin)
		if err != nil {
			t.Fatal(err)
		}
		if err := json.Unmarshal(stdin, &variables); err != nil {
			t.Fatalf("bake stdin: %v", err)
		}
		call := bakeCall{args: cmd.Args, dir: cmd.Dir, tools: variables.Variable.ToolList.Default}
		for _, env := range cmd.Env {
			if value, ok := strings.CutPrefix(env, "REGISTRY="); ok {
				call.registry = value
			}
			if value, ok := strings.CutPrefix(env, "WRITE_CACHE="); ok {
				call.writeCache = value
			}
		}
		*calls = append(*calls, call)
		if slices.Contains(cmd.Args, "--print") {
			_, err := fmt.Fprintf(cmd.Stdout, `{"target":{"final":{"tags":[%q]}}}`, pushImage)
			return err
		}
		if slices.Contains(cmd.Args, "*.output=type=cacheonly") {
			return nil
		}

		platform := &v1.ConfigFile{OS: "linux", Architecture: "arm64"}
		baked := targets(call)
		if slices.Contains(baked, "base") {
			base := testOCIImage(t, platform,
				mutate.Addendum{Layer: testLayer(t, tarEntry{name: "etc/os", body: "debian"})},
				mutate.Addendum{Layer: testLayer(t, tarEntry{name: "home/dev/.bashrc", body: "#"})},
			)
			writeTestLayout(t, filepath.Join(dir, "build", "base-layered-oci"), base, "v1")
		}
		if slices.Contains(baked, "final") {
			tools := testOCIImage(t, platform,
				mutate.Addendum{Layer: testLayer(t, tarEntry{name: "mise/bin/fd", body: "fd"})},
			)
			writeTestLayout(t, filepath.Join(dir, "build", "mise-oci"), tools, "")
		}
		return nil
	}
}

func TestBuildRunsWorkflow(t *testing.T) {
	dir := buildTree(t, "[tools]\nfd = \"1\"\n\"aqua:a/b\" = { version = \"2\" }\nnode = \"3\"\n")
	// Leftovers from a previous run must not break Flatten or Merge.
	for _, name := range []string{"squashed-base", "devenv-oci"} {
		if err := os.MkdirAll(filepath.Join(dir, "build", name), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	var calls []bakeCall
	result, err := ocie.Build(ocie.BuildOptions{
		Dir: dir, Registry: "registry.example", Stdout: io.Discard, Stderr: io.Discard,
		Exec: fakeDocker(t, dir, &calls),
	})
	if err != nil {
		t.Fatal(err)
	}
	var outputs []string
	for _, name := range []string{"base-layered-oci", "squashed-base", "tool-builder-oci", "mise-oci", "devenv-oci"} {
		outputs = append(outputs, filepath.Join(dir, "build", name))
	}
	if result.Tag != "v1" || !slices.Equal(result.Outputs, outputs) || result.Pushed != "" {
		t.Fatalf("Build() = %+v", result)
	}
	output := outputs[len(outputs)-1]

	if len(calls) != 2 {
		t.Fatalf("expected 2 bake calls, got %d", len(calls))
	}
	prefix := []string{"docker", "buildx", "bake",
		"-f", "docker-bake.hcl", "-f", "functions.hcl", "-f", "vars.hcl",
		"-f", "-", "--allow", "fs.read=.."}
	for i, targets := range [][]string{{"base"}, {"tool-builder", "final"}} {
		call := calls[i]
		if want := append(slices.Clone(prefix), targets...); !slices.Equal(call.args, want) {
			t.Errorf("call %d args = %q, want %q", i, call.args, want)
		}
		if call.dir != dir || call.registry != "registry.example" {
			t.Errorf("call %d dir = %q registry = %q", i, call.dir, call.registry)
		}
		if want := []string{"aqua:a/b", "fd", "node"}; !slices.Equal(call.tools, want) {
			t.Errorf("call %d TOOL_LIST = %q, want %q", i, call.tools, want)
		}
		if call.writeCache != "false" {
			t.Errorf("call %d WRITE_CACHE = %q, want false by default", i, call.writeCache)
		}
	}

	merged, descriptor, err := ocie.ReadLayoutImage(output, "v1")
	if err != nil {
		t.Fatal(err)
	}
	if descriptor.Annotations[ocie.TagAnnotation] != "v1" {
		t.Fatalf("output tag = %q", descriptor.Annotations[ocie.TagAnnotation])
	}
	layers, err := merged.Layers()
	if err != nil {
		t.Fatal(err)
	}
	if len(layers) != 2 {
		t.Fatalf("expected flattened base + 1 tool layer, got %d layers", len(layers))
	}
}

func TestBuildPushesThenWritesCache(t *testing.T) {
	dir := buildTree(t, "[tools]\nfd = \"1\"\n")
	pushImage = testRegistry(t) + "/devenv:v1"
	t.Setenv("WRITE_CACHE", "true") // must not leak into the build passes
	var calls []bakeCall
	result, err := ocie.Build(ocie.BuildOptions{
		Dir: dir, Push: true, WriteCache: true, Stdout: io.Discard, Stderr: io.Discard,
		Exec: fakeDocker(t, dir, &calls),
	})
	if err != nil {
		t.Fatal(err)
	}
	output := filepath.Join(dir, "build", "devenv-oci")
	if result.Pushed != pushImage {
		t.Fatalf("pushed %q, want %q", result.Pushed, pushImage)
	}
	var got [][]string
	var cache []string
	for _, call := range calls {
		got = append(got, targets(call))
		cache = append(cache, call.writeCache)
	}
	want := [][]string{
		{"base"},
		{"tool-builder", "final"},
		{"--print", "final"},
		{"--set", "*.output=type=cacheonly", "base", "tool-builder"},
	}
	if fmt.Sprint(got) != fmt.Sprint(want) {
		t.Fatalf("bake targets = %q, want %q", got, want)
	}
	if !slices.Equal(cache, []string{"false", "false", "false", "true"}) {
		t.Fatalf("WRITE_CACHE per call = %q", cache)
	}
	assertPushed(t, output, pushImage)
}

func TestBuildTargets(t *testing.T) {
	for _, c := range []struct {
		targets []string
		noDeps  bool
		bakes   [][]string // bake target batches, in order
		outputs []string
	}{
		{[]string{"base"}, false, [][]string{{"base"}}, []string{"base-layered-oci"}},
		{[]string{"squash"}, false, [][]string{{"base"}}, []string{"base-layered-oci", "squashed-base"}},
		{[]string{"tools", "base"}, false, [][]string{{"base", "tool-builder"}}, []string{"base-layered-oci", "tool-builder-oci"}},
		{[]string{"devenv"}, false, [][]string{{"base"}, {"final"}}, []string{"base-layered-oci", "squashed-base", "mise-oci", "devenv-oci"}},
		{[]string{"final", "final"}, false, [][]string{{"final"}}, []string{"mise-oci"}},
	} {
		t.Run(strings.Join(c.targets, "+"), func(t *testing.T) {
			dir := buildTree(t, "[tools]\nfd = \"1\"\n")
			var calls []bakeCall
			result, err := ocie.Build(ocie.BuildOptions{
				Dir: dir, Targets: c.targets, NoDeps: c.noDeps, Stdout: io.Discard, Stderr: io.Discard,
				Exec: fakeDocker(t, dir, &calls),
			})
			if err != nil {
				t.Fatal(err)
			}
			var bakes [][]string
			for _, call := range calls {
				bakes = append(bakes, targets(call))
			}
			if fmt.Sprint(bakes) != fmt.Sprint(c.bakes) {
				t.Errorf("bakes = %q, want %q", bakes, c.bakes)
			}
			var outputs []string
			for _, output := range result.Outputs {
				outputs = append(outputs, filepath.Base(output))
			}
			if !slices.Equal(outputs, c.outputs) {
				t.Errorf("outputs = %q, want %q", outputs, c.outputs)
			}
		})
	}
}

func TestBuildNoDepsReusesExistingOutputs(t *testing.T) {
	dir := buildTree(t, "[tools]\nfd = \"1\"\n")
	var calls []bakeCall
	options := ocie.BuildOptions{Dir: dir, Stdout: io.Discard, Stderr: io.Discard, Exec: fakeDocker(t, dir, &calls)}
	if _, err := ocie.Build(options); err != nil {
		t.Fatal(err)
	}
	calls = nil
	options.Targets, options.NoDeps = []string{"devenv"}, true
	result, err := ocie.Build(options)
	if err != nil {
		t.Fatal(err)
	}
	if len(calls) != 0 {
		t.Fatalf("-no-deps devenv baked: %+v", calls)
	}
	if result.Tag != "v1" || len(result.Outputs) != 1 || filepath.Base(result.Outputs[0]) != "devenv-oci" {
		t.Fatalf("Build() = %+v", result)
	}

	// Without the outputs it needs, -no-deps fails instead of rebuilding.
	if err := os.RemoveAll(filepath.Join(dir, "build", "squashed-base")); err != nil {
		t.Fatal(err)
	}
	if _, err := ocie.Build(options); err == nil || !strings.Contains(err.Error(), "devenv") {
		t.Fatalf("expected devenv error without squashed-base, got %v", err)
	}
}

func TestBuildRejectsUnknownTarget(t *testing.T) {
	dir := buildTree(t, "[tools]\nfd = \"1\"\n")
	_, err := ocie.Build(ocie.BuildOptions{Dir: dir, Targets: []string{"bogus"}, Exec: func(*exec.Cmd) error {
		t.Fatal("bake ran for an unknown target")
		return nil
	}})
	if err == nil || !strings.Contains(err.Error(), `unknown build target "bogus"`) {
		t.Fatalf("expected unknown-target error, got %v", err)
	}
}

func TestPushBuiltUsesExplicitImageWithoutBake(t *testing.T) {
	dir := buildTree(t, "")
	layoutPath := filepath.Join(dir, "build", "devenv-oci")
	image := testOCIImage(t, &v1.ConfigFile{OS: "linux", Architecture: "arm64"},
		mutate.Addendum{Layer: testLayer(t, tarEntry{name: "a", body: "a"})})
	writeTestLayout(t, layoutPath, image, "v1")
	ref := testRegistry(t) + "/devenv:explicit"
	pushed, err := ocie.PushBuilt(ocie.BuildOptions{Dir: dir, Stderr: io.Discard, Exec: func(*exec.Cmd) error {
		t.Fatal("bake ran although -image was given")
		return nil
	}}, "", ref)
	if err != nil || pushed != ref {
		t.Fatalf("PushBuilt() = %q, %v", pushed, err)
	}
	assertPushed(t, layoutPath, ref)
}

func TestWriteCacheExportsOnly(t *testing.T) {
	dir := buildTree(t, "[tools]\nfd = \"1\"\n")
	var calls []bakeCall
	if err := ocie.WriteCache(ocie.BuildOptions{Dir: dir, Stdout: io.Discard, Stderr: io.Discard,
		Exec: fakeDocker(t, dir, &calls)}); err != nil {
		t.Fatal(err)
	}
	if len(calls) != 1 || calls[0].writeCache != "true" ||
		!slices.Equal(targets(calls[0]), []string{"--set", "*.output=type=cacheonly", "base", "tool-builder"}) {
		t.Fatalf("unexpected calls: %+v", calls)
	}
	if _, err := os.Stat(filepath.Join(dir, "build", "base-layered-oci")); !os.IsNotExist(err) {
		t.Fatalf("cache export wrote outputs: %v", err)
	}
}

func TestBuildPrintOnlyPrintsDefinition(t *testing.T) {
	dir := buildTree(t, "[tools]\nfd = \"1\"\n")
	var calls []bakeCall
	if _, err := ocie.Build(ocie.BuildOptions{
		Dir: dir, Print: true, Stdout: io.Discard, Stderr: io.Discard,
		Exec: fakeDocker(t, dir, &calls),
	}); err != nil {
		t.Fatal(err)
	}
	if len(calls) != 1 || !slices.Equal(calls[0].args[len(calls[0].args)-4:], []string{"--print", "base", "tool-builder", "final"}) {
		t.Fatalf("unexpected calls: %+v", calls)
	}
	if calls[0].registry != "" {
		t.Fatalf("REGISTRY set without -registry: %q", calls[0].registry)
	}
	if _, err := os.Stat(filepath.Join(dir, "build", "stale.json")); err != nil {
		t.Fatalf("print mode touched build directory: %v", err)
	}
}

func TestBuildRejectsMissingTools(t *testing.T) {
	dir := buildTree(t, "[tools]\n")
	_, err := ocie.Build(ocie.BuildOptions{Dir: dir, Exec: func(*exec.Cmd) error {
		t.Fatal("bake ran without tools")
		return nil
	}})
	if err == nil || !strings.Contains(err.Error(), "no tools configured") {
		t.Fatalf("expected missing-tools error, got %v", err)
	}
}

func TestFindBuildxDir(t *testing.T) {
	dir := buildTree(t, "")
	root := filepath.Dir(dir)
	nested := filepath.Join(root, "cli", "src")
	if err := os.MkdirAll(nested, 0o755); err != nil {
		t.Fatal(err)
	}
	for _, start := range []string{dir, root, nested, filepath.Join(dir, "build")} {
		found, err := ocie.FindBuildxDir(start)
		if err != nil || found != dir {
			t.Errorf("FindBuildxDir(%q) = %q, %v; want %q", start, found, err, dir)
		}
	}
}
