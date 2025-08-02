export function TerminalController(_terminalElementtt: HTMLElement) {
	return { write };

	function write(text: string) {
		const resultElement = document.getElementById("terminal-result");
		if (resultElement) {
			resultElement.textContent = text;
			resultElement.setAttribute("command-result", "ok");
		}
	}
}
