package ocie_test

import (
	ocie "connorbraydotnet/devcontainer/ocie/src"

	"bytes"
	"strings"
	"testing"
)

func TestRunDispatch(t *testing.T) {
	cases := []struct {
		args   []string
		code   int
		output string
	}{
		{nil, 2, "Commands:"},
		{[]string{"help"}, 0, "flatten"},
		{[]string{"help", "merge"}, 0, "BASE_LAYOUT TOOL_LAYOUT OUTPUT_LAYOUT"},
		{[]string{"help", "build"}, 0, "-registry"},
		{[]string{"help", "build"}, 0, "devenv   merge the tool layers"},
		{[]string{"help", "build"}, 0, "-write-cache"},
		{[]string{"help", "push"}, 0, "final bake target's tag"},
		{[]string{"cache", "extra"}, 2, "Usage:"},
		{[]string{"bogus"}, 2, `unknown command "bogus"`},
		{[]string{"flatten", "only-one"}, 2, "INPUT_LAYOUT OUTPUT_LAYOUT"},
		{[]string{"merge", "-tag", "", "a", "b", "c"}, 2, "Usage:"},
		{[]string{"flatten", "-h"}, 0, "Usage:"},
		{[]string{"flatten", t.TempDir(), t.TempDir()}, 1, "output already exists"},
	}
	for _, c := range cases {
		var stdout, stderr bytes.Buffer
		code := ocie.Run("ocie", c.args, &stdout, &stderr)
		if code != c.code {
			t.Errorf("%q: exit %d, want %d", c.args, code, c.code)
		}
		if out := stdout.String() + stderr.String(); !strings.Contains(out, c.output) {
			t.Errorf("%q: output %q missing %q", c.args, out, c.output)
		}
	}
}
