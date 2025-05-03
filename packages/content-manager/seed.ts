import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { $ } from "bun";

//#region setup
const BUCKET_NAME = "connorbray-net-preview" as const;
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
		try {
			await $`wrangler r2 object put ${destinationPath} -f ${sourcePath} --local`.quiet();
			return file;
		} catch (error) {
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
