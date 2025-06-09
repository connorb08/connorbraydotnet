export enum Quality {
	Low = 50,
	MediumLow = 60,
	Medium = 70,
	MediumHigh = 80,
	High = 90,
}

export function calculateWidth(size: string | null): number {
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
export function forbiddenReferer(request: Request): boolean {
	const referer = request.headers.get("Referer");
	if (
		referer &&
		!allowedReferers.some((allowed) => referer.includes(allowed))
	) {
		return true;
	}
	return false;
}

export function getOutputType(request: Request): ImageOutputOptions["format"] {
	const accept = request.headers.get("Accept") || "";
	if (/image\/avif/.test(accept)) {
		return "image/avif";
	}
	if (/image\/webp/.test(accept)) {
		return "image/webp";
	}

	return "image/jpeg";
}

export async function getImages(env: Env): Promise<Response> {
	const content = await env.BUCKET.list();
	const objects = content.objects.map((object) => object.key);
	return new Response(JSON.stringify(objects), {
		headers: { "Content-Type": "application/json" },
	});
}

export function isImage(contentType: string): boolean {
	return contentType.startsWith("image/");
}
