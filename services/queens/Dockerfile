FROM mcr.microsoft.com/dotnet/sdk:10.0-noble AS browser

ENV PLAYWRIGHT_BROWSERS_PATH=/opt/
COPY ./Browser /app

WORKDIR /app
RUN dotnet build
RUN pwsh bin/Debug/net10.0/playwright.ps1 install chromium

FROM ubuntu:24.04 AS deps

RUN apt-get update && apt-get install -y --no-install-recommends \
  libatk1.0-0 \
  libatspi2.0-0 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libxkbcommon-x11-0 \
  libasound2t64 \
  libglib2.0-0 \
  libnspr4 \
  libnss3 \
  libdbus-1-3 \
  libxfixes3 \
  libgbm1 \
  && rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:10.0-noble AS build

COPY ./Queens /app/Queens
COPY ./Lambda /app/Lambda
COPY --from=browser /app /app/Browser
WORKDIR /app/Lambda
RUN dotnet publish -c Release -o /app/publish
RUN chmod +x /app/publish/.playwright/node/*/node

FROM mcr.microsoft.com/dotnet/runtime:10.0-noble-chiseled AS runtime

WORKDIR /var/task

COPY --from=browser /opt /opt
COPY --from=deps /lib/aarch64-linux-gnu /lib/aarch64-linux-gnu
COPY --from=build /app/publish .

ENV PLAYWRIGHT_BROWSERS_PATH=/opt/

ENTRYPOINT ["/usr/bin/dotnet", "exec", "/var/task/bootstrap.dll"]
