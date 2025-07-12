import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { $ } from "bun";

//#region setup
const IS_PROD = process.env.NODE_ENV === "production";
const BUCKET_NAME = IS_PROD
	? ("connorbray-net" as const)
	: ("connorbray-net-preview" as const);
const currentDirectory = import.meta.dir;
const seedDirectory = join(currentDirectory, "seed");
//#endregion

//#region seeding
console.log("Seeding content manager...");

const filePaths = await readdir(seedDirectory, {
	recursive: true,
	withFileTypes: true,
});

const seedFiles = filePaths
	.filter((file) => file.isFile())
	.map((file) => {
		const relativePath = file.parentPath.replace(`${seedDirectory}/`, "");
		return join(relativePath, file.name);
	});

const result = await Promise.allSettled(
	Array.from(seedFiles).map(async (file) => {
		const sourcePath = resolve(seedDirectory, file);
		const destinationPath = `${BUCKET_NAME}/${file}`;
		const fileObject = Bun.file(file);
		const contentType = fileObject.type;
		try {
			const command = `wrangler r2 object put ${destinationPath} -f ${sourcePath} --content-type ${contentType} ${IS_PROD ? "--remote" : "--local"}`;
			await $`${command}`.quiet();
			return file;
		} catch (_error) {
			return Promise.reject(`${file}`);
		}
	}),
);

console.log("Seeding complete.");
//#endregion

//#region reporting

const uploadedFiles: string[] = [];

result.forEach((res) => {
	if (res.status === "fulfilled") {
		uploadedFiles.push(res.value);
	} else {
		console.error("Upload failed:", res.reason);
	}
});

console.log("Uploaded files:", uploadedFiles);

//#endregion
