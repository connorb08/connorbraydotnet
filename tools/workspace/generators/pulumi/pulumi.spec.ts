import type { PulumiGeneratorSchema } from "./schema";
import type { Tree } from "@nx/devkit";
import { pulumiGenerator } from "./generator.js";
import { readJson } from "@nx/devkit";
import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";

describe("pulumi generator", () => {
	let tree: Tree;
	const options: PulumiGeneratorSchema = {
		name: "test",
	};

	beforeEach(() => {
		tree = createTreeWithEmptyWorkspace();
	});

	it("should run successfully", async () => {
		await pulumiGenerator(tree, options);
		const pkg = readJson(tree, "inf/test/package.json");
		expect(pkg.name).toBe("inf-test");
		expect(pkg.type).toBe("module");
		expect(pkg.main).toBe("src/index.ts");
		expect(pkg.scripts.deploy).toBe("pulumi up");
		expect(pkg.scripts["deploy:preview"]).toBe("pulumi preview");
		expect(pkg.peerDependencies).toEqual({
			"@pulumi/pulumi": "*",
			"@pulumiverse/grafana": "*",
		});
		expect(pkg.nx.targets.deploy.cache).toBe(false);
		expect(pkg.nx.targets["deploy:preview"].cache).toBe(false);
		expect(readJson(tree, "inf/test/tsconfig.json").extends).toBe("../tsconfig.json");
		expect(tree.exists("inf/test/project.json")).toBe(false);
		expect(tree.read("inf/test/src/index.ts", "utf-8")).toContain("export {}");
		expect(tree.read("inf/test/Pulumi.yaml", "utf-8")).toMatch(/name: ["']?test["']?/);
		expect(tree.read("inf/test/Pulumi.yaml", "utf-8")).toContain("typescript: false");
		expect(tree.read("inf/test/Pulumi.dev.yaml", "utf-8")).toContain("secretsprovider: awskms://");
	});

	it("should support a parent directory within inf", async () => {
		await pulumiGenerator(tree, { ...options, directory: "Apps" });
		expect(readJson(tree, "inf/Apps/test/package.json").name).toBe("inf-apps-test");
		expect(readJson(tree, "inf/Apps/test/tsconfig.json").extends).toBe("../../tsconfig.json");
		expect(tree.exists("inf/Apps/test/src/index.ts")).toBe(true);
	});
});
