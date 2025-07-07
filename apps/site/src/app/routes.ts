import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";

const routeConfig = [
	layout("../layouts/main-layout/index.tsx", [
		index("routes/index.tsx"),
		{
			path: "/about",
			file: "routes/about.tsx",
			id: "about",
		},
		{
			path: "/projects",
			file: "routes/projects.tsx",
			id: "projects",
		},
		{
			path: "*",
			file: "routes/404.tsx",
			id: "404",
		},
	]),
	route("/content/*", "routes/content.ts"),
] satisfies RouteConfig;

export default routeConfig;
