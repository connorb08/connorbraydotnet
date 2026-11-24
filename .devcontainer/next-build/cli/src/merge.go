package ocie

import (
	"fmt"
	"maps"
	"strings"

	v1 "github.com/google/go-containerregistry/pkg/v1"
	"github.com/google/go-containerregistry/pkg/v1/mutate"
	"github.com/google/go-containerregistry/pkg/v1/types"
)

// Merge appends the layers of the tool image onto the base image, combines
// their configuration and writes the result to the new layout output.
func Merge(basePath, toolsPath, output, tag string) error {
	if err := checkOutput(output); err != nil {
		return err
	}
	base, descriptor, err := ReadLayoutImage(basePath, "")
	if err != nil {
		return fmt.Errorf("read base image: %w", err)
	}
	tools, _, err := ReadLayoutImage(toolsPath, "")
	if err != nil {
		return fmt.Errorf("read tool image: %w", err)
	}
	baseConfig, err := base.ConfigFile()
	if err != nil {
		return fmt.Errorf("read base configuration: %w", err)
	}
	toolConfig, err := tools.ConfigFile()
	if err != nil {
		return fmt.Errorf("read tool configuration: %w", err)
	}
	if baseConfig.OS != toolConfig.OS || baseConfig.Architecture != toolConfig.Architecture ||
		(baseConfig.Variant != "" && toolConfig.Variant != "" && baseConfig.Variant != toolConfig.Variant) {
		return fmt.Errorf("incompatible image platforms: base %s/%s/%s, tools %s/%s/%s",
			baseConfig.OS, baseConfig.Architecture, baseConfig.Variant,
			toolConfig.OS, toolConfig.Architecture, toolConfig.Variant)
	}
	baseManifest, err := base.Manifest()
	if err != nil {
		return fmt.Errorf("read base manifest: %w", err)
	}
	toolManifest, err := tools.Manifest()
	if err != nil {
		return fmt.Errorf("read tool manifest: %w", err)
	}
	baseHistory, err := imageHistory(baseConfig, len(baseManifest.Layers))
	if err != nil {
		return fmt.Errorf("base history: %w", err)
	}
	toolHistory, err := imageHistory(toolConfig, len(toolManifest.Layers))
	if err != nil {
		return fmt.Errorf("tool history: %w", err)
	}
	layers, err := tools.Layers()
	if err != nil {
		return fmt.Errorf("read tool layers: %w", err)
	}
	var additions []mutate.Addendum
	layerIndex := 0
	for _, history := range toolHistory {
		if history.EmptyLayer {
			continue
		}
		layer := toolManifest.Layers[layerIndex]
		additions = append(additions, mutate.Addendum{
			Layer:       layers[layerIndex],
			History:     history,
			Annotations: layer.Annotations,
			URLs:        layer.URLs,
			MediaType:   layer.MediaType,
		})
		layerIndex++
	}
	merged, err := mutate.Append(base, additions...)
	if err != nil {
		return fmt.Errorf("append tool layers: %w", err)
	}
	config, err := merged.ConfigFile()
	if err != nil {
		return fmt.Errorf("read merged configuration: %w", err)
	}
	config = config.DeepCopy()
	config.Config, err = mergeConfig(baseConfig.Config, toolConfig.Config)
	if err != nil {
		return fmt.Errorf("merge runtime configuration: %w", err)
	}
	config.History = append(append([]v1.History{}, baseHistory...), toolHistory...)
	merged, err = mutate.ConfigFile(merged, config)
	if err != nil {
		return fmt.Errorf("apply merged configuration: %w", err)
	}
	merged = mutate.MediaType(merged, types.OCIManifestSchema1)
	merged = mutate.ConfigMediaType(merged, types.OCIConfigJSON)
	annotations := map[string]string{}
	maps.Copy(annotations, baseManifest.Annotations)
	maps.Copy(annotations, toolManifest.Annotations)
	baseDigest, err := base.Digest()
	if err != nil {
		return fmt.Errorf("read base digest: %w", err)
	}
	annotations["org.opencontainers.image.base.digest"] = baseDigest.String()
	annotated, ok := mutate.Annotations(merged, annotations).(v1.Image)
	if !ok {
		return fmt.Errorf("annotated merge result is not an image")
	}
	descriptor.Annotations = map[string]string{TagAnnotation: tag}
	if descriptor.Platform == nil {
		descriptor.Platform = baseConfig.Platform()
	}
	return writeLayout(output, annotated, descriptor)
}

func imageHistory(config *v1.ConfigFile, layerCount int) ([]v1.History, error) {
	if len(config.History) == 0 {
		history := make([]v1.History, layerCount)
		for i := range history {
			history[i] = v1.History{Created: config.Created, CreatedBy: "import OCI layer"}
		}
		return history, nil
	}
	count := 0
	for _, history := range config.History {
		if !history.EmptyLayer {
			count++
		}
	}
	if count != layerCount {
		return nil, fmt.Errorf("%d non-empty history entries for %d layers", count, layerCount)
	}
	return config.History, nil
}

func mergeConfig(base, tools v1.Config) (v1.Config, error) {
	config := base.DeepCopy()
	positions := map[string]int{}
	var environment []string
	for _, entries := range [][]string{base.Env, tools.Env} {
		for i, entry := range entries {
			name, _, valid := strings.Cut(entry, "=")
			if !valid || name == "" {
				return v1.Config{}, fmt.Errorf("invalid environment entry at index %d", i)
			}
			if position, exists := positions[name]; exists {
				environment[position] = entry
			} else {
				positions[name] = len(environment)
				environment = append(environment, entry)
			}
		}
	}
	config.Env = environment
	if tools.User != "" {
		config.User = tools.User
	}
	if tools.WorkingDir != "" {
		config.WorkingDir = tools.WorkingDir
	}
	if tools.Cmd != nil {
		config.Cmd = tools.Cmd
	}
	if tools.Entrypoint != nil {
		config.Entrypoint = tools.Entrypoint
	}
	if tools.StopSignal != "" {
		config.StopSignal = tools.StopSignal
	}
	if tools.Shell != nil {
		config.Shell = tools.Shell
	}
	if tools.OnBuild != nil {
		config.OnBuild = tools.OnBuild
	}
	if tools.Healthcheck != nil {
		config.Healthcheck = tools.Healthcheck
	}
	if len(tools.Labels) != 0 {
		if config.Labels == nil {
			config.Labels = map[string]string{}
		}
		maps.Copy(config.Labels, tools.Labels)
	}
	if len(tools.Volumes) != 0 {
		if config.Volumes == nil {
			config.Volumes = map[string]struct{}{}
		}
		maps.Copy(config.Volumes, tools.Volumes)
	}
	if len(tools.ExposedPorts) != 0 {
		if config.ExposedPorts == nil {
			config.ExposedPorts = map[string]struct{}{}
		}
		maps.Copy(config.ExposedPorts, tools.ExposedPorts)
	}
	return *config, nil
}
