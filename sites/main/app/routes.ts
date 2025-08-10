import { index, layout, prefix, type RouteConfig, route } from "@react-router/dev/routes";

const routeConfig = [
	layout("../layouts/main/layout.tsx", [
		index("routes/index.tsx"),
		route("about", "routes/about.tsx"),
		route("photos", "routes/photos.tsx"),
		route("contact", "routes/contact/contact.tsx"),
		...prefix("/projects", [
			index("routes/projects/index.tsx"),
			route(":projectId", "routes/projects/project.tsx"),
			route("queens", "routes/projects/queens/index.tsx"),
		]),
		{
			path: "*",
			file: "routes/404.tsx",
			id: "404",
		},
	]),
	route("/cdn/*", "routes/cdn.ts"),
] satisfies RouteConfig;

export default routeConfig;
