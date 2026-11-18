import { requireCredential } from "../shared/config";
import { resolveOutput } from "./mock-runtime";
import { Config, isSecret, runtime } from "@pulumi/pulumi";
import { beforeAll, expect, test } from "bun:test";
import process from "node:process";

beforeAll(() => {
	runtime.setAllConfig({
		"Helpers:credential": "  test-credential  ",
	});
});

test("shared credentials preserve their value and Pulumi secret tracking", async () => {
	const credential = requireCredential(new Config("Helpers"), "credential", "Example");
	expect(await resolveOutput(credential)).toBe("  test-credential  ");
	expect(await isSecret(credential)).toBe(true);
});

test.each([
	["empty", ""],
	["whitespace", " \n\t "],
])(
	"shared credentials reject %s values with application context",
	async (_key, value) => {
		const child = Bun.spawn(
			[
				process.execPath,
				"-e",
				`
import { Config, runtime } from ${JSON.stringify(import.meta.resolve("@pulumi/pulumi"))};
import { requireCredential } from ${JSON.stringify(import.meta.resolve("../shared/config"))};
runtime.setAllConfig({ "Helpers:credential": ${JSON.stringify(value)} });
requireCredential(new Config("Helpers"), "credential", "Example");
`,
			],
			{ stdout: "pipe", stderr: "pipe" },
		);
		const [exitCode, stderr] = await Promise.all([
			child.exited,
			new Response(child.stderr).text(),
		]);
		expect(exitCode).not.toBe(0);
		expect(stderr).toContain("Example: credential must not be empty.");
	},
);

test("shared credentials still require the configuration key", () => {
	expect(() => requireCredential(new Config("Helpers"), "missing", "Example")).toThrow(
		"Helpers:missing",
	);
});
