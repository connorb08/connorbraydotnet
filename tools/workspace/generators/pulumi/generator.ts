import type { PulumiGeneratorSchema } from "./schema";
import {
	formatFiles,
	generateFiles,
	names,
	type Tree,
} from "@nx/devkit";
import { join, relative } from "node:path";

export async function pulumiGenerator(tree: Tree, options: PulumiGeneratorSchema) {
	const projectRoot = join("inf", options.directory ?? "", options.name);
	generateFiles(tree, join(import.meta.dirname, "files"), projectRoot, {
		...options,
		packageName: names(projectRoot.split("/").join("-")).fileName,
		tsconfigExtends: `${relative(projectRoot, "inf")}/tsconfig.json`,
	});
	await formatFiles(tree);
}

export default pulumiGenerator;
