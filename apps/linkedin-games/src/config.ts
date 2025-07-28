export type Config = {
	readonly headless: boolean;
	readonly Urls: {
		readonly Queens: string;
	};
};

const config = {
	headless: true,
	Urls: {
		Queens: "https://www.linkedin.com/games/view/queens/desktop",
	},
} satisfies Config;

export default config;
