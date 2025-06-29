import style from "./home.module.scss";

const sections = [{}, {}, {}, {}];

function Home() {
	return (
		<div className={style.home}>
			<div className={style.hero}>
				<h2 className={style.hero__title}>Hero Title</h2>
				<p className={style.hero__subtitle}>Hero Subtitle</p>
				<p className={style.hero__content}>Hero content</p>
			</div>
			<div className={style.content}>
				{sections.map((_, index) => (
					<section key={index} className={style.section}>
						<h2 className={style.section__title}>Section {index + 1}</h2>
						<p className={style.section__content}>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
							eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
							enim ad minim veniam, quis nostrud exercitation ullamco laboris
							nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
							reprehenderit in voluptate velit esse
						</p>
					</section>
				))}
			</div>
		</div>
	);
}

export default Home;
