// Tries all three ADs sequentially.
// Waits 5–8 minutes between failed rounds.
// Retries only capacity errors.
// Awaits AD configuration changes.
// Stops after success or any other error.

import { LocalWorkspace, type UpResult } from "@pulumi/pulumi/automation/index.js";
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

	let completedResult: UpResult;

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
			completedResult = result;
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
					const waitMinutes = 5 + Math.random() * 3;

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

	const summary = JSON.stringify(completedResult.summary, null, 2);

	await writeFile(new URL("../../flag_success", import.meta.url), summary);
}

try {
	await deployUntilAvailable();
} catch (error: unknown) {
	try {
		await writeFile(
			new URL("../../flag_error", import.meta.url),
			Error.isError(error) ? error.message : String(error),
		);
	} catch (flagError: unknown) {
		throw new AggregateError(
			[error, flagError],
			"Deployment failed and the error flag could not be written",
			{ cause: flagError },
		);
	}
	throw error;
}
