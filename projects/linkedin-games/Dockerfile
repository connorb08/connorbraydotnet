FROM oven/bun:1.2.18-alpine AS build

WORKDIR /app
COPY . .
RUN bun install --production --frozen-lockfile
RUN bun run build.ts

FROM oven/bun:1.2.18-alpine AS main

WORKDIR /app

ENV HEADLESS=true
ENV LOG_LEVEL=error

COPY --from=build /app/dist .
COPY --from=build /app/node_modules/playwright ./node_modules/playwright
COPY --from=build /app/node_modules/playwright-core ./node_modules/playwright-core

RUN apk upgrade -U -a --no-cache \
    && apk add --no-cache \
    libstdc++ \
    chromium \
    harfbuzz \
    nss \
    freetype \
    && rm -rf /var/cache/* \
    && mkdir /var/cache/apk

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

EXPOSE 3000

CMD ["bun", "run", "index.js"]
