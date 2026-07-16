const cache = caches.default;

function getCacheKey(request: Request): URL {
	const cacheKey = new URL(request.url);
	const size = cacheKey.searchParams.get("size") || "default";

	cacheKey.search = "";
	cacheKey.searchParams.append("size", size);

	return cacheKey;
}

async function getFromCache(request: Request): Promise<Response | undefined> {
	return await cache.match(getCacheKey(request));
}

async function putInCache(request: Request, response: Response): Promise<void> {
	await cache.put(getCacheKey(request), response);
}

export { getFromCache, putInCache, getCacheKey };
