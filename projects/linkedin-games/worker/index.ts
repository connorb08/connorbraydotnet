export default {
	async fetch(request, env, ctx): Promise<Response> {
		try {
			return new Response("res");
		} catch (error) {
			return new Response("err");
		}
	},
} satisfies ExportedHandler<Env>;
