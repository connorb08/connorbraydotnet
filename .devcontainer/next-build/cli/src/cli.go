// Package ocie manipulates local OCI image layouts and implements the ocie CLI:
//
//	ocie flatten [-tag latest] INPUT_LAYOUT OUTPUT_LAYOUT
//	ocie merge   [-tag latest] BASE_LAYOUT TOOL_LAYOUT OUTPUT_LAYOUT
//	ocie build   [-dir DIR] [-tools FILE] [-registry REGISTRY] [-no-deps] [-print] [-push] [-write-cache] [TARGET...]
//	ocie push    [-dir DIR] [-tools FILE] [-registry REGISTRY] [-layout DIR] [-image REF]
//	ocie cache   [-dir DIR] [-tools FILE] [-registry REGISTRY]
package ocie

import (
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
)

type command struct {
	name    string
	args    []string
	summary string
	// variadic accepts any number of arguments; args only documents them.
	variadic bool
	// details, when set, is printed after the flags in the command's usage.
	details func() string
	// setup registers the command's flags and returns the action to run once
	// they are parsed. The action returns a success message.
	setup func(flags *flag.FlagSet, stdout, stderr io.Writer) func(args []string) (string, error)
}

// errUsage makes Run print the command's usage and exit with status 2.
var errUsage = errors.New("usage")

func tagFlag(flags *flag.FlagSet, help string) *string {
	return flags.String("tag", "latest", help)
}

var commands = []command{
	{
		name:    "flatten",
		args:    []string{"INPUT_LAYOUT", "OUTPUT_LAYOUT"},
		summary: "Squash every layer of an image into a single layer, keeping its configuration",
		setup: func(flags *flag.FlagSet, _, _ io.Writer) func([]string) (string, error) {
			tag := tagFlag(flags, "tag to select from the input and apply to the output")
			return func(args []string) (string, error) {
				if *tag == "" {
					return "", errUsage
				}
				if err := Flatten(args[0], args[1], *tag); err != nil {
					return "", err
				}
				return fmt.Sprintf("Wrote single-layer OCI image to %s (tag %s)", args[1], *tag), nil
			}
		},
	},
	{
		name:    "merge",
		args:    []string{"BASE_LAYOUT", "TOOL_LAYOUT", "OUTPUT_LAYOUT"},
		summary: "Append a tool image's layers onto a base image and combine their configuration",
		setup: func(flags *flag.FlagSet, _, _ io.Writer) func([]string) (string, error) {
			tag := tagFlag(flags, "tag for the output image")
			return func(args []string) (string, error) {
				if *tag == "" {
					return "", errUsage
				}
				if err := Merge(args[0], args[1], args[2], *tag); err != nil {
					return "", err
				}
				return fmt.Sprintf("Wrote merged OCI image to %s (tag %s)", args[2], *tag), nil
			}
		},
	},
	{
		name:     "build",
		args:     []string{"[TARGET...]"},
		variadic: true,
		summary:  "Build the devenv image, or just the given targets and what they need",
		details:  buildTargetHelp,
		setup: func(flags *flag.FlagSet, stdout, stderr io.Writer) func([]string) (string, error) {
			options := workflowFlags(flags, stdout, stderr)
			noDeps := flags.Bool("no-deps", false, "build only the named targets, reusing existing outputs of the targets they need")
			print := flags.Bool("print", false, "print the resolved bake definition of the baked targets instead of building")
			push := flags.Bool("push", false, "push build/devenv-oci to the final bake target's tag after building")
			writeCache := flags.Bool("write-cache", false, "export the build cache to the registry after everything else succeeds")
			return func(targets []string) (string, error) {
				opts, err := options()
				if err != nil {
					return "", err
				}
				opts.Targets, opts.NoDeps = targets, *noDeps
				opts.Print, opts.Push, opts.WriteCache = *print, *push, *writeCache
				result, err := Build(opts)
				if err != nil || *print {
					return "", err
				}
				var lines []string
				for _, output := range result.Outputs {
					lines = append(lines, "Wrote "+output)
				}
				if result.Tag != "" {
					lines = append(lines, "Tag "+result.Tag)
				}
				if result.Pushed != "" {
					lines = append(lines, "Pushed "+result.Pushed)
				}
				return strings.Join(lines, "\n"), nil
			}
		},
	},
	{
		name:    "push",
		summary: "Push the built devenv image to the final bake target's tag",
		setup: func(flags *flag.FlagSet, stdout, stderr io.Writer) func([]string) (string, error) {
			options := workflowFlags(flags, stdout, stderr)
			layoutPath := flags.String("layout", "", "OCI layout to push (default: DIR/build/devenv-oci)")
			image := flags.String("image", "", "destination reference (default: the final bake target's tag)")
			return func([]string) (string, error) {
				opts, err := options()
				if err != nil {
					return "", err
				}
				ref, err := PushBuilt(opts, *layoutPath, *image)
				if err != nil {
					return "", err
				}
				return "Pushed " + ref, nil
			}
		},
	},
	{
		name:    "cache",
		summary: "Export the bake build cache to the registry",
		setup: func(flags *flag.FlagSet, stdout, stderr io.Writer) func([]string) (string, error) {
			options := workflowFlags(flags, stdout, stderr)
			return func([]string) (string, error) {
				opts, err := options()
				if err != nil {
					return "", err
				}
				if err := WriteCache(opts); err != nil {
					return "", err
				}
				return "Wrote build cache", nil
			}
		},
	},
}

func buildTargetHelp() string {
	var b strings.Builder
	b.WriteString("Targets (default: all):\n")
	for _, target := range BuildTargets {
		fmt.Fprintf(&b, "  %-8s %s -> build/%s", target.Name, target.Summary, target.Output)
		if len(target.Needs) > 0 {
			fmt.Fprintf(&b, " (needs %s)", strings.Join(target.Needs, ", "))
		}
		b.WriteString("\n")
	}
	fmt.Fprintf(&b, "  %-8s %s\n", AllTarget, strings.Join(allTargets, " + "))
	return b.String()
}

// workflowFlags registers the flags shared by the bake-driven commands and
// returns a function resolving them into BuildOptions after parsing.
func workflowFlags(flags *flag.FlagSet, stdout, stderr io.Writer) func() (BuildOptions, error) {
	dir := flags.String("dir", "", "buildx directory with the bake files (default: search from the working directory)")
	tools := flags.String("tools", "", "mise tools.toml listing the tools to build (default: DIR/../tools.toml)")
	registry := flags.String("registry", "", "override the REGISTRY bake variable")
	return func() (BuildOptions, error) {
		opts := BuildOptions{Dir: *dir, ToolsFile: *tools, Registry: *registry, Stdout: stdout, Stderr: stderr}
		if opts.Dir == "" {
			cwd, err := os.Getwd()
			if err != nil {
				return opts, err
			}
			if opts.Dir, err = FindBuildxDir(cwd); err != nil {
				return opts, err
			}
		}
		return opts, nil
	}
}

// Main runs the CLI against the process arguments and exits.
func Main() {
	log.SetFlags(0)
	os.Exit(Run(filepath.Base(os.Args[0]), os.Args[1:], os.Stdout, os.Stderr))
}

// Run executes the CLI with args (excluding the program name) and returns the
// process exit code: 0 on success, 1 on failure, 2 on usage errors.
func Run(program string, args []string, stdout, stderr io.Writer) int {
	if len(args) == 0 {
		usage(program, stderr)
		return 2
	}
	switch args[0] {
	case "-h", "-help", "--help", "help":
		if len(args) > 1 {
			if cmd := lookup(args[1]); cmd != nil {
				flags := newFlagSet(program, cmd, stdout)
				cmd.setup(flags, stdout, stderr)
				flags.Usage()
				return 0
			}
		}
		usage(program, stdout)
		return 0
	}
	cmd := lookup(args[0])
	if cmd == nil {
		fmt.Fprintf(stderr, "%s: unknown command %q\n\n", program, args[0])
		usage(program, stderr)
		return 2
	}

	flags := newFlagSet(program, cmd, stderr)
	action := cmd.setup(flags, stdout, stderr)
	if err := flags.Parse(args[1:]); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			return 0
		}
		return 2
	}
	if !cmd.variadic && flags.NArg() != len(cmd.args) {
		flags.Usage()
		return 2
	}
	message, err := action(flags.Args())
	if errors.Is(err, errUsage) {
		flags.Usage()
		return 2
	}
	if err != nil {
		fmt.Fprintf(stderr, "%s %s: %v\n", program, cmd.name, err)
		return 1
	}
	if message != "" {
		fmt.Fprintln(stdout, message)
	}
	return 0
}

func lookup(name string) *command {
	for i := range commands {
		if commands[i].name == name {
			return &commands[i]
		}
	}
	return nil
}

func newFlagSet(program string, cmd *command, output io.Writer) *flag.FlagSet {
	flags := flag.NewFlagSet(program+" "+cmd.name, flag.ContinueOnError)
	flags.SetOutput(output)
	flags.Usage = func() {
		out := flags.Output()
		fmt.Fprintf(out, "Usage: %s %s [flags]", program, cmd.name)
		for _, arg := range cmd.args {
			fmt.Fprintf(out, " %s", arg)
		}
		fmt.Fprintf(out, "\n\n%s.\n\nFlags:\n", cmd.summary)
		flags.PrintDefaults()
		if cmd.details != nil {
			fmt.Fprintf(out, "\n%s", cmd.details())
		}
	}
	return flags
}

func usage(program string, out io.Writer) {
	fmt.Fprintf(out, "Usage: %s <command> [flags] [arguments]\n\nCommands:\n", program)
	for _, cmd := range commands {
		fmt.Fprintf(out, "  %-8s %s\n", cmd.name, cmd.summary)
	}
	fmt.Fprintf(out, "\nRun '%s help <command>' for details.\n", program)
}
