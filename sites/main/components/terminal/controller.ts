import type { FormEventHandler } from "react";
import { useCallback, useState } from "react";
import type { NavigateFunction } from "react-router";

type CommandResultStatus = "ok" | "error";

type TerminalControllerArgs = {
	nav: NavigateFunction;
	pathname: string;
};

type TerminalRuntime = {
	nav: NavigateFunction;
	pathname: string;
	writeTerminalResult: (text: string, status?: CommandResultStatus) => void;
	clearTerminal: () => void;
};

function runTerminalCommand(rawInput: string, runtime: TerminalRuntime) {
	const { nav, pathname, writeTerminalResult, clearTerminal } = runtime;
	const [command, ...args] = rawInput.split(" ");

	switch (command) {
		case "ls": {
			const hiddenPaths = [".", ".."];
			let pathList = ["about", "projects", "photos"];

			if (args[0] === "-a") {
				pathList = hiddenPaths.concat(pathList);
			}

			writeTerminalResult(pathList.join(" "));
			break;
		}
		case "cd": {
			if (args.length === 0) {
				writeTerminalResult("Usage: cd <directory>");
				return;
			}

			clearTerminal();
			const path = args.join(" ").replace(/~/g, "");
			nav(path, { viewTransition: true });
			break;
		}
		case "pwd":
			writeTerminalResult(`Current directory: ~${pathname}`);
			break;
		case "clear":
			clearTerminal();
			break;
		default:
			writeTerminalResult(
				`Command not found: ${command}. Type 'help' for a list of available commands.`,
				"error",
			);
	}
}

function useTerminalExecution() {
	const [resultText, setResultText] = useState("");
	const [resultStatus, setResultStatus] = useState<CommandResultStatus>("ok");

	const writeTerminalResult = useCallback((text: string, status: CommandResultStatus = "ok") => {
		setResultText(text);
		setResultStatus(status);
	}, []);

	const clearTerminal = useCallback(() => {
		writeTerminalResult("", "ok");
	}, [writeTerminalResult]);

	return {
		resultText,
		resultStatus,
		writeTerminalResult,
		clearTerminal,
	};
}

export function useTerminalController({ nav, pathname }: TerminalControllerArgs) {
	const { resultText, resultStatus, writeTerminalResult, clearTerminal } = useTerminalExecution();

	const handleSubmit: FormEventHandler<HTMLFormElement> = //useCallback(
		(event) => {
			event.preventDefault();

			const formData = new FormData(event.currentTarget);
			const input = `${formData.get("terminal-command") ?? ""}`.trim();
			if (input === "") {
				return;
			}

			event.currentTarget.reset();
			runTerminalCommand(input, {
				nav,
				pathname,
				writeTerminalResult,
				clearTerminal,
			});
		}
	// 	[clearTerminal, nav, pathname, writeTerminalResult],
	// );

	return {
		resultText,
		resultStatus,
		handleSubmit,
	};
}
