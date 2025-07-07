FROM node:24-slim AS build

WORKDIR /app

COPY . .
RUN npm install --omit=dev
RUN npm run build

FROM node:24-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HEADLESS=true
ENV LOG_LEVEL=error

COPY --from=build /app/dist .
COPY --from=build /app/node_modules/playwright ./node_modules/playwright
COPY --from=build /app/node_modules/playwright-core ./node_modules/playwright-core
RUN /app/node_modules/playwright/cli.js install --with-deps chromium

EXPOSE 3000
CMD ["node", "index.js"]