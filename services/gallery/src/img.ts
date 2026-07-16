import { Hono } from "hono";
import { getFromCache, putInCache } from "./img/cache";
import { getWidth, type Size, sizes } from "./img/utils";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/:key", async (ctx) => {
	const CF_IMG = ctx.env.IMAGES;
	const bucket = ctx.env.BUCKET;
	const { key } = ctx.req.param();
	const size = ctx.req.query("size") || "default";

	if (!sizes.includes(size as Size)) {
		return ctx.json({ error: "Invalid parameters" }, 400);
	}

	const cachedResponse = await getFromCache(ctx.req.raw);
	if (cachedResponse) {
		return cachedResponse;
	}

	const imageKey = `/dist/${key}`;
	const img = await bucket.get(imageKey, {});

	if (img === null) {
		return ctx.json({ error: "Not Found" }, 404);
	}

	const contentType = img.httpMetadata?.contentType;

	if (contentType === undefined || !contentType.startsWith("image/")) {
		return ctx.json({ error: "Not an image" }, 500);
	}

	const acceptHeader = ctx.req.header("accept") || "";
	const format = acceptHeader.includes("image/avif")
		? "avif"
		: acceptHeader.includes("image/webp")
			? "webp"
			: "jpeg";

	const out = await CF_IMG.input(img.body)
		.transform({
			width: getWidth(size as Size),
			fit: "scale-down",
			sharpen: 0.5,
		})
		.output({
			format: `image/${format}`,
			quality: 80,
		});

	const newResponse = new Response(out.image(), {
		headers: {
			"Content-Type": out.contentType(),
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});

	ctx.executionCtx.waitUntil(putInCache(ctx.req.raw, newResponse.clone()));
	return newResponse;
});

export default app;
