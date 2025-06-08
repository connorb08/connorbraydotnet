import { WorkerEntrypoint } from "cloudflare:workers";

enum Quality {
	Low = 50,
	MediumLow = 60,
	Medium = 70,
	MediumHigh = 80,
	High = 90,
}

function calculateWidth(size: string | null): number {
	switch (size) {
		case "sm":
			return 640;
		case "md":
			return 1280;
		case "lg":
			return 1920;
		default:
			return 1920;
	}
}

const allowedReferers = ["https://connorbray.net", "127.0.0.1"];
function forbiddenReferer(request: Request): boolean {
	const referer = request.headers.get("Referer");
	if (
		referer &&
		!allowedReferers.some((allowed) => referer.includes(allowed))
	) {
		return true;
	}
	return false;
}

function getOutputType(request: Request): ImageOutputOptions["format"] {
	const accept = request.headers.get("Accept") || "";
	if (/image\/avif/.test(accept)) {
		return "image/avif";
	}
	if (/image\/webp/.test(accept)) {
		return "image/webp";
	}

	return "image/jpeg";
}

async function getImages(env: Env): Promise<Response> {
	const content = await env.BUCKET.list();
	const objects = content.objects.map((object) => object.key);
	return new Response(JSON.stringify(objects), {
		headers: { "Content-Type": "application/json" },
	});
}

function isImage(contentType: string): boolean {
	return contentType.startsWith("image/");
}

export default class MainEntrypoint extends WorkerEntrypoint<Env> {
	/**
	 * Default HTTP Handler
	 */
	override async fetch(request: Request): Promise<Response> {
		try {
			if (forbiddenReferer(request)) {
				return new Response("Forbidden", { status: 403 });
			}

			/* Get path key from URL */
			const key = new URL(request.url).pathname.replace("/", "");

			/* If no key is provided, return a list of images */
			if (key === "list") {
				return getImages(this.env);
			}

			/* Get size parameter from URL */
			const size = new URL(request.url).searchParams.get("size");
			const width = calculateWidth(size);

			/* If no key is provided, return a list of images */
			const object = await this.env.BUCKET.get(key, {});
			if (!object) {
				return new Response("Not Found", { status: 404 });
			}

			// Get content type of the object
			const contentType =
				object.httpMetadata?.contentType || "application/octet-stream";

			if (isImage(contentType)) {
				const transformer = this.env.IMAGES.input(object.body);
				transformer.transform({
					background: "#000000",
					fit: "contain",
					sharpen: 1,
					width: width,
				});
				const output = await transformer.output({
					quality: Quality.Medium,
					format: getOutputType(request),
				});
				return output.response();
			}
			return new Response(object.body, {
				headers: {
					"Content-Type": contentType,
				},
			});
		} catch (error) {
			console.error("Error processing request:", error);
			return new Response("Internal Server Error", { status: 500 });
		}
	}
}
