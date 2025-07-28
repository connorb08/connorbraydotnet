import { WorkerEntrypoint } from "cloudflare:workers";
import {
	calculateWidth,
	forbiddenReferer,
	getImages,
	getOutputType,
	isImage,
	Quality,
} from "./utils";

export class MainEntrypoint extends WorkerEntrypoint<Env> {
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

			/* Return 404 if not found */
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

export default MainEntrypoint;
