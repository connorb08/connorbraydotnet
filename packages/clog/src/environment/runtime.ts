// export const RuntimeEnvironment = {
// 	Node: "node",
// 	Bun: "bun",
// 	Deno: "deno",
// 	CloudflareWorkers: "cloudflare-workers",
// 	Electron: "electron",
// 	Browser: "browser",
// 	Unknown: "unknown",
// } as const;

// export const Runtime: (typeof RuntimeEnvironment)[keyof typeof RuntimeEnvironment] =
// 	(() => {
// 		const runtimeUserAgent = navigator.userAgent;

// 		if (runtimeUserAgent.startsWith("Node.js")) {
// 			return RuntimeEnvironment.Node;
// 		}

// 		if (runtimeUserAgent.startsWith("Bun")) {
// 			return RuntimeEnvironment.Bun;
// 		}

// 		if (runtimeUserAgent.startsWith("Deno")) {
// 			return RuntimeEnvironment.Deno;
// 		}

// 		if (runtimeUserAgent.startsWith("Cloudflare-Workers")) {
// 			return RuntimeEnvironment.CloudflareWorkers;
// 		}

// 		if (runtimeUserAgent.startsWith("Electron")) {
// 			return RuntimeEnvironment.Electron;
// 		}

// 		if (
// 			runtimeUserAgent.includes("Chrome") ||
// 			runtimeUserAgent.includes("Firefox") ||
// 			runtimeUserAgent.includes("Safari") ||
// 			runtimeUserAgent.includes("Mozilla")
// 		) {
// 			return RuntimeEnvironment.Browser;
// 		}

// 		return RuntimeEnvironment.Unknown;
// 	})();
