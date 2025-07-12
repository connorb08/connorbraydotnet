FROM node:lts-slim

ENV NODE_ENV=production
ENV HEADLESS=true
ENV LOG_LEVEL=error
# ENV DEBUG=pw:browser

WORKDIR /app
RUN npx playwright install --with-deps --no-shell chromium

COPY . .
RUN npm ci
RUN npm run esbuild

EXPOSE 3000
ENTRYPOINT [ "node", "dist/index.js" ]