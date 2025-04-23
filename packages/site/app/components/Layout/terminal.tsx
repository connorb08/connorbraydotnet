import type { ChangeEventHandler } from "react";
import { useLocation } from "react-router";
import style from "./terminal.module.scss";

export default function () {
	const location = useLocation().pathname;

	return (
		<footer className={style.footer} onClick={focusInput} onKeyDown={() => {}}>
			<div className={style.footer__terminal}>
				<p
					id="terminal-result"
					className={style.footer__terminal__result}
					command-result="ok"
				>
					&nbsp;
				</p>
				<div className={style.footer__terminal__entry}>
					<span
						id="terminal-prompt"
						className={style.footer__terminal__entry__prompt}
						data-after="_"
					>
						{`connorbray.net -> ~${location} (main) $`}
					</span>
					<input
						id="terminal-input"
						className={style.footer__terminal__entry__input}
						type="text"
						onChange={handleType}
						onBlur={removeCursor}
						onFocus={handleFocus}
						tabIndex={0}
						autoComplete="off"
						onKeyDown={handleKeyDown}
						// biome-ignore lint/a11y/noAutofocus: <explanation>
						autoFocus={true}
					/>
				</div>
			</div>
		</footer>
	);
}

const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
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
		case "cd":
			if (args.length === 0) {
				writeTerminalResult("Usage: cd <directory>", false);
			} else {
				const path = args.join(" ").replace(/~/g, "");
				window.location.href = path;
			}
			break;
		case "pwd":
			writeTerminalResult(
				`Current directory: ~${window.location.pathname}`,
				false,
			);
			break;
		case "clear":
			clearTerminal();
			break;
		default:
			writeTerminalResult(
				`Command not found: ${command}. Type 'help' for a list of available commands.`,
				true,
			);
	}
};

const writeTerminalResult = (result: string, error = false) => {
	const terminalResult = document.getElementById("terminal-result");
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
	document
		.getElementById("terminal-prompt")
		?.setAttribute("data-after", dataAfterValue);
};

const focusInput = () => {
	document.getElementById("terminal-input")?.focus();
};

const handleType: ChangeEventHandler<HTMLInputElement> = (event) => {
	document
		.getElementById("terminal-prompt")
		?.setAttribute(
			"data-after",
			`${"\xa0".repeat(event.target.value.length)}_`,
		);
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
