const CONTENT_URL = "https://content.connorbray.net/";

interface ProjectConfig {
	contentUrl: string;
}

// export const config = {
//     contentUrl: process.env.CONTENT_URL || CONTENT_URL,
// } satisfies ProjectConfig;

export const config = {
	contentUrl: CONTENT_URL,
} satisfies ProjectConfig;

export default config;
