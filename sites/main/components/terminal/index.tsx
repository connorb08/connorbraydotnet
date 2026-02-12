import { useId } from "react";
import { useLocation, useNavigate } from "react-router";
import { useTerminalController } from "./controller";
import style from "./style.module.scss";

export default function Terminal() {
	const location = useLocation().pathname;
	const nav = useNavigate();
	const inputId = useId().replace(/:/g, "-");
	const terminal = useTerminalController({ nav, pathname: location });

	return (
		<form className={style.container} onSubmit={terminal.handleSubmit}>
			<label className={style.container__terminal} htmlFor={inputId}>
				<output
					className={style.container__terminal__result}
					command-result={terminal.resultStatus}
					aria-live="polite"
				>
					{terminal.resultText || "\u00a0"}
				</output>
				<div className={style.container__terminal__entry}>
					<span className={style.container__terminal__entry__prompt}>
						{`connorbray.net -> ~${location} (main) $`}
					</span>
					<input
						id={inputId}
						name="terminal-command"
						className={style.container__terminal__entry__input}
						type="text"
						autoComplete="off"
						aria-label="Terminal command input"
					/>
				</div>
			</label>
			{/* <button
				type="submit"
				className={style.container__terminal__entry__submit}
				aria-hidden="true"
				tabIndex={-1}
			/> */}
		</form>
	);
}
