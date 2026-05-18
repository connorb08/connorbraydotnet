import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("db/migrate", "routes/db/migrate.tsx"),
	route("db/rollback", "routes/db/rollback.tsx"),
] satisfies RouteConfig;
