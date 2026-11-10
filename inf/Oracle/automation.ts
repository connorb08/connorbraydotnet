// Tries all three ADs sequentially.
// Waits 15–30 minutes between the first three failed rounds, then 60–65 minutes.
// Retries only capacity errors.
// Awaits AD configuration changes.
// Stops after success or any other error.

import { LocalWorkspace } from "@pulumi/pulumi/automation/index.js";
import { writeFile } from "node:fs/promises";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath } from "node:url";

async function deployUntilAvailable() {
	const stack = await LocalWorkspace.selectStack({
		stackName: "dev",
		workDir: fileURLToPath(new URL(".", import.meta.url)),
	});

	const indexes = ["0", "1", "2"];
	let currentIndex = 0;

	let tries = 0;
	let completedRounds = 0;

	while (true) {
		tries++;
		try {
			console.log(`Attempt number: ${tries} with domain index: ${indexes[currentIndex]}`);

			const domainIndex = indexes[currentIndex];
			if (!domainIndex) {
				throw new Error("Domain index is not defined");
			}
			// oxlint-disable-next-line
			await stack.setConfig("domainIndex", { value: domainIndex });

			// oxlint-disable-next-line
			const result = await stack.up();

			console.log(result);
			break;
		} catch (error: unknown) {
			let errorMessage = "";
			if (Error.isError(error)) {
				errorMessage = error.message;
			} else {
				console.error(error);
				throw error;
			}

			// retry
			if (errorMessage.toLowerCase().includes("out of host capacity")) {
				currentIndex++;
				if (currentIndex >= indexes.length) {
					currentIndex = 0;
					completedRounds++;
					const waitMinutes =
						completedRounds <= 3 ? 15 + Math.random() * 15 : 60 + Math.random() * 5;

					console.log(
						`All availability domains are out of host capacity. Waiting ${waitMinutes.toFixed(1)} minutes before round ${completedRounds + 1}...`,
					);

					// oxlint-disable-next-line
					await setTimeout(waitMinutes * 60_000); // wait before retrying the next round
				} else {
					console.log("Out of host capacity; trying the next availability domain.");
				}
				continue;
			}

			throw error;
		}
	}

	await writeFile(new URL("../../flag_success", import.meta.url), "");
}

try {
	await deployUntilAvailable();
} catch (error: unknown) {
	try {
		await writeFile(new URL("../../flag_error", import.meta.url), "");
	} catch (flagError: unknown) {
		throw new AggregateError(
			[error, flagError],
			"Deployment failed and the error flag could not be written",
			{ cause: flagError },
		);
	}
	throw error;
}
