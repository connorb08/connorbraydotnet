import type { ChangeEventHandler, RefObject } from "react";
import { useCallback } from "react";
import type { NavigateFunction } from "react-router";

export function useTerminalController(ref: RefObject<HTMLElement | null>, nav: NavigateFunction) {
	const write = useCallback(
		(text: string) => {
			const resultElement = ref?.current ?? document.getElementById("terminal-result");
			if (resultElement) {
				resultElement.textContent = text;
				resultElement.setAttribute("command-result", "ok");
			}
		},
		[ref],
	);

	const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter") {
			return;
		}
		const input = event.currentTarget.value.trim();

		if (input === "") {
			return;
		}

		event.currentTarget.value = "";
		resetCursorPosition();

		const params = input.split(" ");
		const command = params[0];
		const args = params.slice(1);

		switch (command) {
			case "ls": {
				const hiddenPaths = [".", ".."];
				let pathList = ["about", "projects", "photos"];
				if (args.length > 0) {
					if (args[0] === "-a") {
						pathList = hiddenPaths.concat(pathList);
					}
				}
				writeTerminalResult(ref, pathList.join(" "), false);
				break;
			}
			case "cd":
				if (args.length === 0) {
					writeTerminalResult(ref, "Usage: cd &lt;directory&gt;", false);
				} else {
					clearTerminal();
					const path = args.join(" ").replace(/~/g, "");
					nav(path, { viewTransition: true });
				}
				break;
			case "pwd":
				writeTerminalResult(ref, `Current directory: ~${window.location.pathname}`, false);
				break;
			case "clear":
				clearTerminal();
				break;
			default:
				writeTerminalResult(ref,
					`Command not found: ${command}. Type 'help' for a list of available commands.`,
					true,
				);
		}
	}, [ref, nav]);

	return { write, handleKeyDown, handleType, handleFocus, clearTerminal, resetCursorPosition, removeCursor };
}
// const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
// 	if (event.key !== "Enter") {
// 		return;
// 	}
// 	const input = event.currentTarget.value.trim();

// 	if (input === "") {
// 		return;
// 	}

// 	event.currentTarget.value = "";
// 	resetCursorPosition();

// 	const params = input.split(" ");
// 	const command = params[0];
// 	const args = params.slice(1);

// 	switch (command) {
// 		case "ls": {
// 			const hiddenPaths = [".", ".."];
// 			let pathList = ["about", "projects", "photos"];
// 			if (args.length > 0) {
// 				if (args[0] === "-a") {
// 					pathList = hiddenPaths.concat(pathList);
// 				}
// 			}
// 			writeTerminalResult(pathList.join(" "), false);
// 			break;
// 		}
// 		case "cd":
// 			if (args.length === 0) {
// 				writeTerminalResult("Usage: cd &lt;directory&gt;", false);
// 			} else {
// 				clearTerminal();
// 				const path = args.join(" ").replace(/~/g, "");
// 				nav(path, { viewTransition: true });
// 			}
// 			break;
// 		case "pwd":
// 			writeTerminalResult(`Current directory: ~${window.location.pathname}`, false);
// 			break;
// 		case "clear":
// 			clearTerminal();
// 			break;
// 		default:
// 			writeTerminalResult(
// 				`Command not found: ${command}. Type 'help' for a list of available commands.`,
// 				true,
// 			);
// 	}
// };

const writeTerminalResult = (ref: RefObject<HTMLElement | null>, result: string, error = false) => {
	const terminalResult = ref?.current;
	if (terminalResult) {
		terminalResult.innerHTML = result;
		if (error) {
			terminalResult.setAttribute("command-result", "error");
		} else {
			terminalResult.setAttribute("command-result", "ok");
		}
	}
};

// Handlers

const handleFocus: ChangeEventHandler<HTMLInputElement> = (event) => {
	const dataAfterValue = `${"\xa0".repeat(event.target.value.length)}_`;
	document.getElementById("terminal-prompt")?.setAttribute("data-after", dataAfterValue);
};

// const focusInput = () => {
// 	document.getElementById("terminal-input")?.focus();
// };

const handleType: ChangeEventHandler<HTMLInputElement> = (event) => {
	document
		.getElementById("terminal-prompt")
		?.setAttribute("data-after", `${"\xa0".repeat(event.target.value.length)}_`);
};

const clearTerminal = () => {
	const terminalResult = document.getElementById("terminal-result");
	if (terminalResult) {
		terminalResult.innerHTML = "&nbsp;";
	}
	document.getElementById("terminal-input")?.focus();
};

const resetCursorPosition = () => {
	document.getElementById("terminal-prompt")?.setAttribute("data-after", "_");
};

const removeCursor = () => {
	document.getElementById("terminal-prompt")?.setAttribute("data-after", "");
};

// export function TerminalController(_terminalElementtt: HTMLElement) {
// 	return { write };

// 	function write(text: string) {
// 		const resultElement = document.getElementById("terminal-result");
// 		if (resultElement) {
// 			resultElement.textContent = text;
// 			resultElement.setAttribute("command-result", "ok");
// 		}
// 	}
// }
