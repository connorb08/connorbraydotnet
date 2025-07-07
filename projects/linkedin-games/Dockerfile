FROM node:24-slim AS build

WORKDIR /app

ENV HEADLESS=true
ENV LOG_LEVEL=error
ENV NODE_ENV=production

COPY . .

RUN npm install --omit=dev
RUN npm run build
# RUN npx -y playwright install --with-deps chromium

# FROM gcr.io/distroless/nodejs24-debian12 AS runner
FROM node:24-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV HEADLESS=true
ENV LOG_LEVEL=error

COPY --from=build /app/dist .
COPY --from=build /app/node_modules/playwright ./node_modules/playwright
COPY --from=build /app/node_modules/playwright-core ./node_modules/playwright-core
RUN /app/node_modules/playwright/cli.js install --with-deps chromium
# RUN apt update 
# && apt-get install -y --no-install-recommends libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libcairo2 libcups2 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0 libnspr4 libnss3 libpango-1.0-0 libx11-6 libxcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2 xvfb fonts-noto-color-emoji fonts-unifont libfontconfig1 libfreetype6 xfonts-scalable fonts-liberation fonts-ipafont-gothic fonts-wqy-zenhei fonts-tlwg-loma-otf fonts-freefont-ttf
# COPY --from=build /root/.cache/ms-playwright/chromium_headless_shell-1179/chrome-linux/headless_shell /root/.cache/ms-playwright/chromium_headless_shell-1179/chrome-linux/headless_shell

CMD ["node", "index.js"]