import { createRequestHandler, RouterContextProvider } from "react-router";
import { type AppContext, cfContext } from "#app/context";

declare module "react-router" {
	export interface AppLoadContext extends AppContext {}
}

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	async fetch(request, env, ctx) {
		const context = new RouterContextProvider();
		context.set(cfContext, { env, ctx });
		return requestHandler(request, context);
	},
} satisfies ExportedHandler<Env>;
