package ocie

import (
	"compress/gzip"
	"errors"
	"fmt"
	"io"
	"log"
	"os"

	v1 "github.com/google/go-containerregistry/pkg/v1"
	"github.com/google/go-containerregistry/pkg/v1/empty"
	"github.com/google/go-containerregistry/pkg/v1/mutate"
	"github.com/google/go-containerregistry/pkg/v1/tarball"
	"github.com/google/go-containerregistry/pkg/v1/types"
)

// Flatten squashes the tagged image in input into a single-layer image
// written to the new layout output.
func Flatten(input, output, tag string) error {
	if err := checkOutput(output); err != nil {
		return err
	}
	image, selected, err := ReadLayoutImage(input, tag)
	if err != nil {
		return err
	}
	config, err := image.ConfigFile()
	if err != nil {
		return fmt.Errorf("read source configuration: %w", err)
	}
	imageManifest, err := image.Manifest()
	if err != nil {
		return fmt.Errorf("read source manifest: %w", err)
	}

	temp, err := os.CreateTemp("", "oci-flatten-*.tar")
	if err != nil {
		return fmt.Errorf("create temporary filesystem archive: %w", err)
	}
	defer func() {
		if err := os.Remove(temp.Name()); err != nil {
			log.Printf("remove temporary archive %s: %v", temp.Name(), err)
		}
	}()
	rootfs := mutate.Extract(image)
	_, copyErr := io.Copy(temp, rootfs)
	if err := errors.Join(copyErr, rootfs.Close(), temp.Close()); err != nil {
		return fmt.Errorf("merge filesystem layers: %w", err)
	}
	layer, err := tarball.LayerFromFile(temp.Name(),
		tarball.WithMediaType(types.OCILayer),
		tarball.WithCompressionLevel(gzip.DefaultCompression),
	)
	if err != nil {
		return fmt.Errorf("create flattened layer: %w", err)
	}

	config = config.DeepCopy()
	config.RootFS.DiffIDs = nil
	config.History = nil
	flat, err := mutate.ConfigFile(empty.Image, config)
	if err != nil {
		return fmt.Errorf("preserve source configuration: %w", err)
	}
	flat, err = mutate.Append(flat, mutate.Addendum{
		Layer: layer,
		History: v1.History{
			Created:   config.Created,
			CreatedBy: "flatten local OCI image",
		},
	})
	if err != nil {
		return fmt.Errorf("append flattened layer: %w", err)
	}
	flat = mutate.MediaType(flat, types.OCIManifestSchema1)
	flat = mutate.ConfigMediaType(flat, types.OCIConfigJSON)
	annotated, ok := mutate.Annotations(flat, imageManifest.Annotations).(v1.Image)
	if !ok {
		return errors.New("annotated result is not an image")
	}
	return writeLayout(output, annotated, selected)
}
