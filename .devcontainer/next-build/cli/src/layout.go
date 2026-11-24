package ocie

import (
	"errors"
	"fmt"
	"os"

	v1 "github.com/google/go-containerregistry/pkg/v1"
	"github.com/google/go-containerregistry/pkg/v1/empty"
	"github.com/google/go-containerregistry/pkg/v1/layout"
)

// TagAnnotation is the OCI index annotation that names an image tag.
const TagAnnotation = "org.opencontainers.image.ref.name"

func checkOutput(output string) error {
	if _, err := os.Lstat(output); err == nil {
		return fmt.Errorf("output already exists: %s; choose a new output directory", output)
	} else if !errors.Is(err, os.ErrNotExist) {
		return fmt.Errorf("check output: %w", err)
	}
	return nil
}

// ReadLayoutImage loads the single image in an OCI layout whose tag matches
// tag, or the only image when tag is empty.
func ReadLayoutImage(input, tag string) (v1.Image, v1.Descriptor, error) {
	source, err := layout.FromPath(input)
	if err != nil {
		return nil, v1.Descriptor{}, fmt.Errorf("open input layout: %w", err)
	}
	index, err := source.ImageIndex()
	if err != nil {
		return nil, v1.Descriptor{}, fmt.Errorf("read input index: %w", err)
	}
	manifest, err := index.IndexManifest()
	if err != nil {
		return nil, v1.Descriptor{}, fmt.Errorf("read input descriptors: %w", err)
	}
	var selected *v1.Descriptor
	for _, descriptor := range manifest.Manifests {
		if tag != "" && descriptor.Annotations[TagAnnotation] != tag {
			continue
		}
		if selected != nil {
			return nil, v1.Descriptor{}, fmt.Errorf("multiple descriptors match selection %q; use a single-image layout", tag)
		}
		selected = &descriptor
	}
	if selected == nil {
		return nil, v1.Descriptor{}, fmt.Errorf("image selection %q not found in input layout", tag)
	}
	if !selected.MediaType.IsImage() {
		return nil, v1.Descriptor{}, fmt.Errorf("selection %q must reference a single image manifest, not %s; export the desired platform first", tag, selected.MediaType)
	}
	image, err := source.Image(selected.Digest)
	if err != nil {
		return nil, v1.Descriptor{}, fmt.Errorf("load source image: %w", err)
	}
	return image, *selected, nil
}

func writeLayout(output string, image v1.Image, descriptor v1.Descriptor) error {
	if err := os.Mkdir(output, 0755); err != nil {
		return fmt.Errorf("create output directory: %w", err)
	}
	destination, err := layout.Write(output, empty.Index)
	if err != nil {
		return fmt.Errorf("initialize output layout: %w", err)
	}
	options := []layout.Option{layout.WithAnnotations(descriptor.Annotations)}
	if descriptor.Platform != nil {
		options = append(options, layout.WithPlatform(*descriptor.Platform))
	}
	if err := destination.AppendImage(image, options...); err != nil {
		return fmt.Errorf("write OCI image: %w", err)
	}
	return nil
}
