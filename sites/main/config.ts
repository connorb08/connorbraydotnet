const CONTENT_URL = "https://content.connorbray.net/";

interface ProjectConfig {
	contentUrl: string;
}

export default {
	contentUrl: CONTENT_URL,
} satisfies ProjectConfig;
