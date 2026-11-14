import type { ResourceTransformationArgs } from "@pulumi/pulumi";
import { requireRecord } from "../Cluster/src/utils.ts";
import { resolveOutput } from "./mock-runtime.ts";
import { runtime } from "@pulumi/pulumi";
import { expect, test } from "bun:test";

test("enables protected KV v2 and AWS mounts without writing credentials or secret values", async () => {
	const resources: { type: string; inputs: Record<string, unknown> }[] = [];
	const registrations: ResourceTransformationArgs[] = [];
	await runtime.setMocks(
		{
			newResource: (args) => {
				const inputs = requireRecord(args.inputs, "Mock inputs must be a mapping.");
				resources.push({ type: args.type, inputs });
				return { id: args.name, state: inputs };
			},
			call: (args) => args.inputs,
		},
		"Vault",
		"test",
		false,
	);
	let configuration: typeof import("../Vault/src/index.ts") | undefined;
	await runtime.runInPulumiStack(async () => {
		runtime.registerStackTransformation((args) => {
			registrations.push(args);
		});
		configuration = await import("../Vault/src/index.ts");
		return {};
	});
	await runtime.disconnect();

	if (!configuration) {
		throw new Error("Vault module failed to load.");
	}
	const component = registrations.find(
		(args) => args.type === "connor-bray:infrastructure:Vault",
	);
	if (!component || !(component.resource instanceof configuration.Vault)) {
		throw new Error("Missing Vault component registration.");
	}
	expect(await resolveOutput(component.resource.secretEngines.kv.mountPath)).toBe(
		"secret",
	);
	expect(await resolveOutput(component.resource.secretEngines.aws.mountPath)).toBe("aws");
	const mounts = resources.filter((resource) => resource.type.startsWith("vault:"));
	expect(mounts).toHaveLength(2);
	expect(mounts).toEqual(
		expect.arrayContaining([
			{
				type: "vault:index/mount:Mount",
				inputs: {
					path: "secret",
					type: "kv",
					options: { version: "2" },
				},
			},
			{
				type: "vault:index/mount:Mount",
				inputs: { path: "aws", type: "aws" },
			},
		]),
	);
	const secretEngines = registrations.find(
		(args) => args.type === "connor-bray:infrastructure:vault:SecretsEngines",
	);
	if (!secretEngines) {
		throw new Error("Missing secrets engines collection.");
	}
	expect(secretEngines.opts.parent).toBe(component.resource);
	for (const [name, type] of [
		["kv-engine", "connor-bray:infrastructure:vault:secret-engines:Kv"],
		["aws-engine", "connor-bray:infrastructure:vault:secret-engines:Aws"],
	]) {
		const engine = registrations.find((args) => args.type === type);
		if (!engine) {
			throw new Error(`Missing secrets engine component: ${type}`);
		}
		const mount = registrations.find(
			(args) => args.type === "vault:index/mount:Mount" && args.name === name,
		);
		if (!mount) {
			throw new Error(`Missing secrets engine registration: ${name}`);
		}
		expect(engine.opts.parent).toBe(secretEngines.resource);
		expect(mount.opts.parent).toBe(engine.resource);
		expect(mount.opts.protect).toBe(true);
	}
});
