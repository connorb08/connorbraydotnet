export default {
	async fetch(request, env, ctx): Promise<Response> {
		return await env.backend.fetch(request);
	},
} satisfies ExportedHandler<Env>;
