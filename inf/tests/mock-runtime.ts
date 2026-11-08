import type { Output, ResourceTransformationArgs } from "@pulumi/pulumi";
import { requireRecord } from "../Kubernetes/src/transforms.ts";
import { runtime } from "@pulumi/pulumi";
import process from "node:process";

export interface ResourceSnapshot {
	type: string;
	name: string;
	inputs: Record<string, unknown>;
}

export const resources: ResourceSnapshot[] = [];
export const registrations: ResourceTransformationArgs[] = [];

export function resolveOutput<T>(output: Output<T>): Promise<T> {
	return new Promise((resolve) => {
		output.apply((value) => {
			resolve(value);
			return value;
		});
	});
}

export async function loadPrograms() {
	process.env.VPS_SSH_PORT = "23456";
	await runtime.setMocks(
		{
			newResource: (args) => {
				const inputs = requireRecord(
					args.inputs,
					"Mock resource inputs must be a mapping.",
				);
				if (
					args.type !== "pulumi:pulumi:Stack" &&
					!args.type.startsWith("pulumi:providers:")
				) {
					resources.push({
						type: args.type,
						name: args.name,
						inputs,
					});
				}
				const state: Record<string, unknown> = { ...inputs };
				if (args.type === "tls:index/privateKey:PrivateKey") {
					Object.assign(state, {
						publicKeyOpenssh: "test-public-key",
						privateKeyOpenssh: "test-private-key",
						privateKeyPem: "test-private-pem",
					});
				}
				if (args.type === "tls:index/selfSignedCert:SelfSignedCert") {
					state.certPem = "test-certificate";
				}
				if (args.type === "aws:s3/bucket:Bucket") {
					state.arn = "arn:aws:s3:::test-bucket";
				}
				if (args.type === "aws:iam/policy:Policy") {
					state.arn = "arn:aws:iam::123456789012:policy/test";
				}
				if (args.type === "aws:lightsail/keyPair:KeyPair") {
					state.name = args.name;
				}
				if (args.type === "aws:lightsail/instance:Instance") {
					state.arn = "arn:aws:lightsail:us-east-2:123456789012:Instance/test";
					state.publicIpAddress = "203.0.113.42";
				}
				return { id: args.name, state };
			},
			call: (args) => requireRecord(args.inputs, "Mock invoke inputs must be a mapping."),
		},
		"Infrastructure",
		"test",
		false,
	);
	runtime.setAllConfig(
		{
			"Infrastructure:tailscaleClientId": "test-client-id",
			"Infrastructure:tailscaleClientSecret": "test-client-secret",
		},
		["Infrastructure:tailscaleClientId", "Infrastructure:tailscaleClientSecret"],
	);

	let programs:
		| {
				amazon: typeof import("../Amazon/src/index.ts");
				backend: typeof import("../Backend/src/index.ts");
				kubernetes: typeof import("../Kubernetes/src/index.ts");
		  }
		| undefined;
	await runtime.runInPulumiStack(async () => {
		runtime.registerStackTransformation((args) => {
			registrations.push(args);
		});
		const amazon = await import("../Amazon/src/index.ts");
		const backend = await import("../Backend/src/index.ts");
		const kubernetes = await import("../Kubernetes/src/index.ts");
		programs = { amazon, backend, kubernetes };
		return { ...amazon, ...backend, ...kubernetes };
	});
	await runtime.disconnect();
	if (programs === undefined) {
		throw new Error("Mock programs failed to load.");
	}
	return programs;
}
