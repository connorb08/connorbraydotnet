import { index, layout, prefix, type RouteConfig, route } from "@react-router/dev/routes";

const routeConfig = [
	layout("../layouts/main/layout.tsx", [
		index("routes/home/index.tsx"),
		route("about", "routes/about/index.tsx"),
		route("_session", "routes/_session.ts"),
		route("gallery", "routes/gallery/index.tsx"),
		route("contact", "routes/contact/contact.tsx"),
		route("queens", "routes/projects/queens/index.tsx"),
		...prefix("/projects", [
			index("routes/projects/index.tsx"),
			route(":projectId", "routes/projects/project.tsx"),
			// route("queens", "routes/projects/queens/index.tsx"),
		]),
		{
			path: "*",
			file: "routes/404/index.tsx",
			id: "404",
		},
	]),
	route("/cdn/*", "routes/cdn.ts"),
] satisfies RouteConfig;

export default routeConfig;
