export default {
	async fetch(request, env, ctx): Promise<Response> {
		const content = await env.BUCKET.list();
		const objects = content.objects.map((object) => object.key);
		return new Response(JSON.stringify(objects), {
			headers: { "Content-Type": "application/json" },
		});
	},
} satisfies ExportedHandler<Env>;
