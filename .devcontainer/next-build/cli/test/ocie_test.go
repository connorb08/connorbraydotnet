package ocie_test

import (
	ocie "connorbraydotnet/devcontainer/ocie/src"

	"archive/tar"
	"bytes"
	"fmt"
	"io"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	v1 "github.com/google/go-containerregistry/pkg/v1"
	"github.com/google/go-containerregistry/pkg/v1/empty"
	"github.com/google/go-containerregistry/pkg/v1/layout"
	"github.com/google/go-containerregistry/pkg/v1/mutate"
	"github.com/google/go-containerregistry/pkg/v1/tarball"
	"github.com/google/go-containerregistry/pkg/v1/types"
)

type tarEntry struct {
	name, body, link string
	mode             int64
}

func testLayer(t *testing.T, entries ...tarEntry) v1.Layer {
	t.Helper()
	var buffer bytes.Buffer
	writer := tar.NewWriter(&buffer)
	for _, entry := range entries {
		header := &tar.Header{Name: entry.name, Mode: entry.mode, Size: int64(len(entry.body)), Typeflag: tar.TypeReg}
		if entry.link != "" {
			header.Typeflag = tar.TypeSymlink
			header.Linkname = entry.link
			header.Size = 0
		}
		if err := writer.WriteHeader(header); err != nil {
			t.Fatal(err)
		}
		if _, err := io.WriteString(writer, entry.body); err != nil {
			t.Fatal(err)
		}
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}
	layer, err := tarball.LayerFromReader(&buffer)
	if err != nil {
		t.Fatal(err)
	}
	return layer
}

func TestFlattenPreservesConfigurationAndMergedFilesystem(t *testing.T) {
	sourceConfig := &v1.ConfigFile{
		Architecture: "arm64",
		OS:           "linux",
		Config: v1.Config{
			User:         "1000:1000",
			Env:          []string{"PATH=/mise/shims:/usr/bin", "EXAMPLE=value"},
			Entrypoint:   []string{"/entrypoint"},
			Cmd:          []string{"bash"},
			WorkingDir:   "/workspace",
			Labels:       map[string]string{"example": "preserved"},
			Volumes:      map[string]struct{}{"/workspace": {}},
			ExposedPorts: map[string]struct{}{"8100/tcp": {}},
		},
	}
	image, err := mutate.ConfigFile(empty.Image, sourceConfig)
	if err != nil {
		t.Fatal(err)
	}
	image, err = mutate.AppendLayers(image,
		testLayer(t,
			tarEntry{name: "deleted", body: "remove me", mode: 0644},
			tarEntry{name: "keep", body: "old", mode: 0644},
			tarEntry{name: "dir/old", body: "hidden by opaque whiteout", mode: 0644},
		),
		testLayer(t,
			tarEntry{name: ".wh.deleted", mode: 0644},
			tarEntry{name: "keep", body: "new", mode: 0755},
			tarEntry{name: "link", link: "keep", mode: 0777},
			tarEntry{name: "dir/.wh..wh..opq", mode: 0644},
			tarEntry{name: "dir/new", body: "visible", mode: 0644},
		),
	)
	if err != nil {
		t.Fatal(err)
	}
	input := filepath.Join(t.TempDir(), "input")
	source, err := layout.Write(input, empty.Index)
	if err != nil {
		t.Fatal(err)
	}
	if err := source.AppendImage(image,
		layout.WithAnnotations(map[string]string{ocie.TagAnnotation: "latest"}),
		layout.WithPlatform(v1.Platform{OS: "linux", Architecture: "arm64"}),
	); err != nil {
		t.Fatal(err)
	}
	output := filepath.Join(t.TempDir(), "output")
	if err := ocie.Flatten(input, output, "latest"); err != nil {
		t.Fatal(err)
	}
	destination, err := layout.FromPath(output)
	if err != nil {
		t.Fatal(err)
	}
	index, err := destination.ImageIndex()
	if err != nil {
		t.Fatal(err)
	}
	manifest, err := index.IndexManifest()
	if err != nil {
		t.Fatal(err)
	}
	if len(manifest.Manifests) != 1 {
		t.Fatalf("got %d output images, want 1", len(manifest.Manifests))
	}
	descriptor := manifest.Manifests[0]
	if descriptor.Annotations[ocie.TagAnnotation] != "latest" || descriptor.Platform == nil || descriptor.Platform.Architecture != "arm64" {
		t.Fatalf("lost tag or platform: %+v", descriptor)
	}
	flat, err := destination.Image(descriptor.Digest)
	if err != nil {
		t.Fatal(err)
	}
	flatManifest, err := flat.Manifest()
	if err != nil {
		t.Fatal(err)
	}
	if len(flatManifest.Layers) != 1 || flatManifest.MediaType != types.OCIManifestSchema1 || flatManifest.Config.MediaType != types.OCIConfigJSON {
		t.Fatalf("expected one-layer OCI image, got %+v", flatManifest)
	}
	config, err := flat.ConfigFile()
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(config.Config, sourceConfig.Config) || config.OS != sourceConfig.OS || config.Architecture != sourceConfig.Architecture {
		t.Fatalf("source configuration changed: %+v", config)
	}
	if len(config.RootFS.DiffIDs) != 1 || len(config.History) != 1 {
		t.Fatalf("layer metadata was not rebuilt: %+v", config)
	}
	rootfs := mutate.Extract(flat)
	defer rootfs.Close()
	reader := tar.NewReader(rootfs)
	files := map[string]tarEntry{}
	for {
		header, err := reader.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			t.Fatal(err)
		}
		body, err := io.ReadAll(reader)
		if err != nil {
			t.Fatal(err)
		}
		files[header.Name] = tarEntry{name: header.Name, body: string(body), link: header.Linkname, mode: header.Mode}
	}
	if _, exists := files["deleted"]; exists {
		t.Fatal("deleted file survived flattening")
	}
	if _, exists := files["dir/old"]; exists {
		t.Fatal("opaque whiteout did not hide the old directory contents")
	}
	if files["keep"].body != "new" || files["keep"].mode != 0755 || files["link"].link != "keep" || files["dir/new"].body != "visible" {
		t.Fatalf("merged filesystem changed: %+v", files)
	}
}

func TestFlattenRejectsMissingTagAndExistingOutput(t *testing.T) {
	input := filepath.Join(t.TempDir(), "input")
	if _, err := layout.Write(input, empty.Index); err != nil {
		t.Fatal(err)
	}
	err := ocie.Flatten(input, filepath.Join(t.TempDir(), "output"), "missing")
	if err == nil || !strings.Contains(err.Error(), "not found") {
		t.Fatalf("expected missing-tag error, got %v", err)
	}
	err = ocie.Flatten(input, input, "latest")
	if err == nil || !strings.Contains(err.Error(), "already exists") {
		t.Fatalf("expected output-exists error, got %v", err)
	}
}

func testLayout(t *testing.T, image v1.Image, tag string) string {
	t.Helper()
	path := filepath.Join(t.TempDir(), "image")
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
	return path
}

func testOCIImage(t *testing.T, config *v1.ConfigFile, additions ...mutate.Addendum) v1.Image {
	t.Helper()
	image, err := mutate.ConfigFile(empty.Image, config)
	if err != nil {
		t.Fatal(err)
	}
	image, err = mutate.Append(image, additions...)
	if err != nil {
		t.Fatal(err)
	}
	image = mutate.MediaType(image, types.OCIManifestSchema1)
	return mutate.ConfigMediaType(image, types.OCIConfigJSON)
}

func TestMergePreservesLayersAndCombinesConfiguration(t *testing.T) {
	for _, existingHistory := range []bool{false, true} {
		t.Run(fmt.Sprintf("existing-tool-history=%t", existingHistory), func(t *testing.T) {
			base := testOCIImage(t, &v1.ConfigFile{
				OS: "linux", Architecture: "arm64",
				Config: v1.Config{
					User: "dev", Cmd: []string{"bash"},
					Env:          []string{"PATH=/usr/bin:/bin", "BASE_ONLY=kept", "SHARED=base"},
					Labels:       map[string]string{"base": "kept", "shared": "base"},
					Volumes:      map[string]struct{}{"/workspace": {}},
					ExposedPorts: map[string]struct{}{"8100/tcp": {}},
				},
			}, mutate.Addendum{
				Layer:       testLayer(t, tarEntry{name: "base", body: "base", mode: 0644}),
				MediaType:   types.OCILayer,
				Annotations: map[string]string{"example.base": "kept"},
			})
			tools := testOCIImage(t, &v1.ConfigFile{
				OS: "linux", Architecture: "arm64",
				Config: v1.Config{
					User: "1000:1000", WorkingDir: "/workspace",
					Env:          []string{"PATH=/mise/bin:/usr/bin:/bin", "SHARED=tools", "VALUE=a=b"},
					Labels:       map[string]string{"tools": "kept", "shared": "tools"},
					Volumes:      map[string]struct{}{"/cache": {}},
					ExposedPorts: map[string]struct{}{"8080/tcp": {}},
				},
			},
				mutate.Addendum{
					Layer:       testLayer(t, tarEntry{name: "mise/tool", body: "tool", mode: 0755}),
					MediaType:   types.OCILayer,
					Annotations: map[string]string{"dev.mise.tool.short": "bun", "dev.mise.tool.version": "1.0.0"},
				},
				mutate.Addendum{
					Layer:       testLayer(t, tarEntry{name: "etc/mise/config.toml", body: "[tools]", mode: 0644}),
					MediaType:   types.OCILayer,
					Annotations: map[string]string{"dev.mise.copy": "/etc/mise/config.toml"},
				},
			)
			toolConfig, err := tools.ConfigFile()
			if err != nil {
				t.Fatal(err)
			}
			toolConfig = toolConfig.DeepCopy()
			toolConfig.History = nil
			if existingHistory {
				toolConfig.History = []v1.History{
					{EmptyLayer: true, CreatedBy: "tool environment"},
					{CreatedBy: "tool installation"},
					{CreatedBy: "tool configuration"},
				}
			}
			tools, err = mutate.ConfigFile(tools, toolConfig)
			if err != nil {
				t.Fatal(err)
			}
			basePath, toolPath := testLayout(t, base, "latest"), testLayout(t, tools, "")
			output := filepath.Join(t.TempDir(), "merged")
			if err := ocie.Merge(basePath, toolPath, output, "release"); err != nil {
				t.Fatal(err)
			}
			merged, descriptor, err := ocie.ReadLayoutImage(output, "release")
			if err != nil {
				t.Fatal(err)
			}
			if descriptor.Platform == nil || descriptor.Platform.OS != "linux" || descriptor.Platform.Architecture != "arm64" {
				t.Fatalf("lost platform: %+v", descriptor)
			}
			baseManifest, err := base.Manifest()
			if err != nil {
				t.Fatal(err)
			}
			toolManifest, err := tools.Manifest()
			if err != nil {
				t.Fatal(err)
			}
			manifest, err := merged.Manifest()
			if err != nil {
				t.Fatal(err)
			}
			expectedLayers := append(append([]v1.Descriptor{}, baseManifest.Layers...), toolManifest.Layers...)
			if !reflect.DeepEqual(manifest.Layers, expectedLayers) {
				t.Fatalf("layer order, bytes, or annotations changed:\ngot: %#v\nwant: %#v", manifest.Layers, expectedLayers)
			}
			baseDigest, err := base.Digest()
			if err != nil {
				t.Fatal(err)
			}
			if manifest.Annotations["org.opencontainers.image.base.digest"] != baseDigest.String() {
				t.Fatal("original base digest not recorded")
			}
			config, err := merged.ConfigFile()
			if err != nil {
				t.Fatal(err)
			}
			expectedEnv := []string{"PATH=/mise/bin:/usr/bin:/bin", "BASE_ONLY=kept", "SHARED=tools", "VALUE=a=b"}
			if !reflect.DeepEqual(config.Config.Env, expectedEnv) || !reflect.DeepEqual(config.Config.Cmd, []string{"bash"}) ||
				config.Config.User != "1000:1000" || config.Config.WorkingDir != "/workspace" {
				t.Fatalf("incorrect runtime configuration: %+v", config.Config)
			}
			if !reflect.DeepEqual(config.Config.Labels, map[string]string{"base": "kept", "tools": "kept", "shared": "tools"}) ||
				len(config.Config.Volumes) != 2 || len(config.Config.ExposedPorts) != 2 {
				t.Fatalf("lost base or tool metadata: %+v", config.Config)
			}
			baseConfig, err := base.ConfigFile()
			if err != nil {
				t.Fatal(err)
			}
			expectedDiffIDs := append(append([]v1.Hash{}, baseConfig.RootFS.DiffIDs...), toolConfig.RootFS.DiffIDs...)
			if !reflect.DeepEqual(config.RootFS.DiffIDs, expectedDiffIDs) {
				t.Fatal("incorrect combined filesystem references")
			}
			if existingHistory {
				expectedHistory := append(append([]v1.History{}, baseConfig.History...), toolConfig.History...)
				if !reflect.DeepEqual(config.History, expectedHistory) {
					t.Fatal("source history was not preserved")
				}
			} else if len(config.History) != 3 {
				t.Fatalf("expected history for all three layers, got %d", len(config.History))
			}
		})
	}
}

func TestMergeRejectsIncompatiblePlatformsAndExistingOutput(t *testing.T) {
	base := testLayout(t, testOCIImage(t, &v1.ConfigFile{OS: "linux", Architecture: "arm64"}), "latest")
	tools := testLayout(t, testOCIImage(t, &v1.ConfigFile{OS: "linux", Architecture: "amd64"}), "")
	err := ocie.Merge(base, tools, filepath.Join(t.TempDir(), "merged"), "latest")
	if err == nil || !strings.Contains(err.Error(), "incompatible image platforms") {
		t.Fatalf("expected platform error, got %v", err)
	}
	err = ocie.Merge(base, tools, base, "latest")
	if err == nil || !strings.Contains(err.Error(), "already exists") {
		t.Fatalf("expected output-exists error, got %v", err)
	}
}
