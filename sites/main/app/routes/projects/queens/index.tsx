import { QueensGrid } from "components/queens/index";
import { cfContext } from "#app/context";
import { getProjectBySlug } from "../../../../data/projects";
import type { Route } from "./+types";
import style from "./queens.module.scss";

export async function loader({ context }: Route.LoaderArgs) {
	try {
		const data = await context.get(cfContext).env.DB.GetQueens();
		return { data, error: undefined };
	} catch (error) {
		console.error("Error fetching queens:", error);
		return { data: undefined, error: "Error" };
	}
}

const pipeline = [
	{
		step: "01",
		title: "Scrape",
		body: "A scheduled AWS Lambda spins up a Playwright headless browser, opens the day's LinkedIn Queens puzzle, and extracts the board's size and color regions.",
	},
	{
		step: "02",
		title: "Solve",
		body: "The board is modeled as an undirected graph. Constraint propagation prunes impossible cells region-by-region until a single valid queen placement remains.",
	},
	{
		step: "03",
		title: "Publish",
		body: "The solution is pushed onto a Cloudflare Queue and rendered here at the edge — the board on the right is today's puzzle, solved automatically.",
	},
];

export default function QueensRoute({ loaderData }: Route.ComponentProps) {
	const { data, error } = loaderData;
	const project = getProjectBySlug("queens");

	if (!project) return null;

	return (
		<article className={style.queens}>
			<header className={style.hero}>
				<div className={style.hero__content}>
					<p className={style.hero__eyebrow}>Automated Puzzle Solver</p>
					<h1 className={style.hero__title}>{project.name}</h1>
					<p className={style.hero__description}>{project.description}</p>

					<ul className={style.tech}>
						{project.technologies.map((tech) => (
							<li key={tech} className={style.tech__chip}>
								{tech}
							</li>
						))}
					</ul>

					{project.repositoryUrl && (
						<a
							href={project.repositoryUrl}
							target="_blank"
							rel="noopener noreferrer"
							className={style.button}
						>
							View Code →
						</a>
					)}
				</div>

				<figure className={style.board}>
					<div className={style.board__frame}>
						{!error && data ? (
							<QueensGrid
								cellColors={data.CellColors}
								colors={data.Colors.map((v) => ({ id: v.Id, rgb: v.RGB, name: v.Name }))}
								queenPositions={data.Queens}
								sideLength={data.SideLength}
								cellsRemoved={data.Removed}
							/>
						) : (
							<div className={style.board__fallback}>
								Today's puzzle is unavailable right now.
							</div>
						)}
					</div>
					<figcaption className={style.board__caption}>
						{!error && data
							? `Today's puzzle — solved automatically (${data.SideLength}×${data.SideLength})`
							: "Live board"}
					</figcaption>
				</figure>
			</header>

			<section className={style.section}>
				<h2 className={style.section__title}>How It Works</h2>
				<div className={style.pipeline}>
					{pipeline.map((item) => (
						<div key={item.step} className={style.pipeline__card}>
							<span className={style.pipeline__step}>{item.step}</span>
							<h3 className={style.pipeline__cardTitle}>{item.title}</h3>
							<p className={style.pipeline__body}>{item.body}</p>
						</div>
					))}
				</div>
			</section>

			<section className={style.section}>
				<h2 className={style.section__title}>The Algorithm</h2>
				<div className={style.split}>
					{project.challenges.length > 0 && (
						<div className={style.split__col}>
							<h3 className={style.split__heading}>Challenges</h3>
							<ul className={style.list}>
								{project.challenges.map((challenge, index) => (
									<li key={index} className={style.list__item}>
										{challenge}
									</li>
								))}
							</ul>
						</div>
					)}
					{project.solutions.length > 0 && (
						<div className={style.split__col}>
							<h3 className={style.split__heading}>Solutions</h3>
							<ul className={style.list}>
								{project.solutions.map((solution, index) => (
									<li key={index} className={style.list__item}>
										{solution}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</section>

			{project.features.length > 0 && (
				<section className={style.section}>
					<h2 className={style.section__title}>Highlights</h2>
					<ul className={style.list}>
						{project.features.map((feature, index) => (
							<li key={index} className={style.list__item}>
								{feature}
							</li>
						))}
					</ul>
				</section>
			)}
		</article>
	);
}
