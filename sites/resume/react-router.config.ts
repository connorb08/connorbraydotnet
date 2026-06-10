import type { Config } from "@react-router/dev/config";

export default {
	ssr: true,
	future: {
		v8_viteEnvironmentApi: true,
		v8_trailingSlashAwareDataRequests: true,
		v8_passThroughRequests: true,
		v8_splitRouteModules: "enforce",
		v8_middleware: true,
	},
	// prerender: true,
} satisfies Config;
