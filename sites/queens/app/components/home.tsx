import { QueensResult } from "components";
import { useMemo, useState } from "react";
import type { QueensSolution } from "types";
import styles from "./home.module.css";

interface Props {
	solution: QueensSolution;
}

function formatDate(d: Date) {
	return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function getPuzzleDate(now = new Date()): Date {
	const year = now.getFullYear(); // local
	const month = now.getMonth();
	const day = now.getDate();

	const switchTs = Date.UTC(year, month, day, 10, 0, 0); // 10:00 UTC for this local day

	if (now.getTime() < switchTs) {
		// Before 10:00 UTC -> use previous local calendar day (handles month/year rollover)
		return new Date(year, month, day - 1);
	}
	// On/after 10:00 UTC -> use current local calendar day
	return new Date(year, month, day);
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: refactor later
export default function Home({ solution }: Props) {
	const [showSolution, setShowSolution] = useState(true);

	const meta = useMemo(() => {
		const puzzleDate = getPuzzleDate(new Date());
		return {
			date: formatDate(puzzleDate),
			side: solution?.sideLength ?? 0,
			queens: solution?.queenPositions?.length ?? 0,
		};
	}, [solution]);

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<div className={styles.titleGroup}>
					<h1 className={styles.title}>LinkedIn Queens</h1>
					<p className={styles.tagline}>A daily solution to the LinkedIn queens puzzle</p>
				</div>
				<div className={styles.dateBlock}>
					<div className={styles.date}>{meta.date}</div>
				</div>
			</header>

			<section className={styles.centerColumn}>
				<div className={styles.boardCard} aria-live="polite">
					<div className={styles.boardHeader}>
						<div className={styles.boardTitle}>
							{meta.date} · {meta.side}×{meta.side}
						</div>
						<div className={styles.boardActions}>
							<button
								type="button"
								className={styles.control}
								onClick={() => setShowSolution((s) => !s)}
								aria-pressed={showSolution}
							>
								{showSolution ? "Hide" : "Show"} Solution
							</button>
							<a
								className={styles.link}
								href="https://github.com/connorb08/queens"
								target="_blank"
								rel="noreferrer"
							>
								View Source
							</a>
						</div>
					</div>

					<div className={styles.boardWrapper}>
						<div className={styles.boardFrame}>
							{showSolution ? (
								<QueensResult {...solution} />
							) : (
								<div className={styles.hiddenPlaceholder}>Solution hidden</div>
							)}
						</div>
					</div>
				</div>

				<aside className={styles.sidebar}>
					<section className={styles.card}>
						<h3>About this project</h3>
						<p>
							The LinkedIn Queens puzzle is a variant of the classic N‑Queens problem. Each row,
							column, and color must contain exactly one queen and no two queens can occupy the same
							2×2 block. The puzzle is solved as a constraint‑satisfaction problem using constraint
							propagation to prune possibilities and find a valid solution.
						</p>
						<ul className={styles.stackList}>
							<li>
								<b>Algorithm:</b> Constraint Propagation
							</li>
							<li>
								<b>Language:</b> TypeScript
							</li>
							<li>
								<b>Integrations:</b> Database · Message Queue
							</li>
							<li>
								<b>Runtime:</b> AWS Lambda · Cloudflare Workers
							</li>
						</ul>
					</section>
				</aside>
			</section>

			<footer className={styles.footer}>
				<div className={styles.footerInner}>
					<div className={styles.copyright}>© {new Date().getFullYear()} Connor Bray </div>
					<div className={styles.footerLinks}>
						<a
							className={styles.iconButton}
							href="https://github.com/connorb08"
							target="_blank"
							rel="noreferrer"
							aria-label="View source on GitHub"
							title="GitHub"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="currentColor"
								xmlns="http://www.w3.org/2000/svg"
							>
								<title>GitHub</title>
								<path d="M12 0.5C5.65 0.5 0.75 5.4 0.75 11.75c0 4.85 3.14 8.97 7.5 10.42.55.1.75-.24.75-.53 0-.26-.01-1.12-.02-2.03-3.05.66-3.69-1.17-3.69-1.17-.5-1.28-1.22-1.62-1.22-1.62-.99-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.97 1.66 2.54 1.18 3.16.9.1-.7.38-1.18.69-1.45-2.44-.28-5-1.22-5-5.42 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.92 0 0 .92-.3 3.02 1.12.88-.25 1.83-.37 2.77-.37.94 0 1.89.12 2.77.37 2.1-1.42 3.02-1.12 3.02-1.12.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.95 0 4.21-2.57 5.14-5.02 5.41.39.34.73 1.02.73 2.06 0 1.48-.01 2.67-.01 3.03 0 .29.2.64.76.53 4.36-1.45 7.5-5.57 7.5-10.42C23.25 5.4 18.35 0.5 12 0.5z" />
							</svg>
							<span className={styles.srOnly}>GitHub</span>
						</a>

						<a
							className={styles.iconButton}
							href="https://www.linkedin.com/in/connorbray/"
							target="_blank"
							rel="noreferrer"
							aria-label="View LinkedIn profile"
							title="LinkedIn"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="currentColor"
								xmlns="http://www.w3.org/2000/svg"
							>
								<title>LinkedIn</title>
								<path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8.5h5v14H0v-14zM9 8.5h4.78v1.92h.07c.67-1.27 2.3-2.61 4.73-2.61C23.16 7.81 24 10.03 24 13.92V22.5h-5v-7.33c0-1.75-.03-4-2.44-4-2.44 0-2.82 1.9-2.82 3.88V22.5H9v-14z" />
							</svg>
							<span className={styles.srOnly}>LinkedIn</span>
						</a>
					</div>
				</div>
				{/* <small className={styles.footerDisclaimer}>
					* This is a personal, non-commercial project and is not affiliated with, endorsed by, or
					connected to LinkedIn Corporation or its affiliates.
				</small> */}
			</footer>
		</main>
	);
}
