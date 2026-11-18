import type {
	ComponentResourceOptions,
	ResourceTransformArgs,
	ResourceTransformResult,
} from "@pulumi/pulumi";
import { requireRecord } from "@connorbraydotnet/infrastructure/transforms";
import { core, helm } from "@pulumi/kubernetes";
import { ComponentResource } from "@pulumi/pulumi";

const storagePath = "/var/mnt/cluster-storage";

export class ClusterLocalStorage extends ComponentResource {
	public readonly chart: helm.v4.Chart;
	public readonly storageClassName = "local-path";

	constructor(options?: ComponentResourceOptions) {
		super(
			"connor-bray:infrastructure:cluster:storage:LocalStorage",
			"local-storage",
			{},
			options,
		);
		const namespace = new core.v1.Namespace(
			"local-path-storage",
			{
				metadata: {
					name: "local-path-storage",
					labels: { "pod-security.kubernetes.io/enforce": "privileged" },
				},
			},
			{ parent: this },
		);
		this.chart = new helm.v4.Chart(
			"local-path-provisioner",
			{
				name: "local-path-provisioner",
				chart:
					"oci://ghcr.io/rancher/local-path-provisioner/charts/local-path-provisioner",
				version: "0.0.37",
				namespace: namespace.metadata.name,
				values: {
					// The trusted helper mounts /var read-only to detect a missing data mount.
					extraArgs: ["--allow-unsafe-helper-pod-template"],
					storageClass: {
						name: this.storageClassName,
						defaultClass: true,
						defaultVolumeType: "local",
						reclaimPolicy: "Retain",
						volumeBindingMode: "WaitForFirstConsumer",
					},
					nodePathMap: [
						{ node: "DEFAULT_PATH_FOR_NON_LISTED_NODES", paths: [storagePath] },
					],
					helperImage: { tag: "1.37.0" },
					configmap: {
						setup: `#!/bin/sh
set -eu
data_device=$(stat -c %d "${storagePath}")
boot_device=$(stat -c %d /host-var)
if [ "$data_device" = "$boot_device" ]; then
  echo "Talos cluster-storage must be mounted on a separate data disk before provisioning." >&2
  exit 1
fi
mkdir -m 0777 -p "$VOL_DIR"`,
					},
				},
			},
			{ dependsOn: [namespace], transforms: [addBootDiskReference], parent: this },
		);
		this.registerOutputs({ storageClassName: this.storageClassName });
	}
}

function addBootDiskReference(
	args: ResourceTransformArgs,
): ResourceTransformResult | undefined {
	if (args.type !== "kubernetes:core/v1:ConfigMap") {
		return undefined;
	}
	const data = requireRecord(args.props.data, "Local storage ConfigMap must have data.");
	return {
		props: {
			...args.props,
			data: {
				...data,
				"helperPod.yaml": JSON.stringify({
					apiVersion: "v1",
					kind: "Pod",
					metadata: { name: "helper-pod" },
					spec: {
						priorityClassName: "system-node-critical",
						tolerations: [
							{
								key: "node.kubernetes.io/disk-pressure",
								operator: "Exists",
								effect: "NoSchedule",
							},
						],
						volumes: [
							{ name: "boot-var", hostPath: { path: "/var", type: "Directory" } },
						],
						containers: [
							{
								name: "helper-pod",
								image: "docker.io/library/busybox:1.37.0",
								volumeMounts: [
									{ name: "boot-var", mountPath: "/host-var", readOnly: true },
								],
							},
						],
					},
				}),
			},
		},
		opts: args.opts,
	};
}
