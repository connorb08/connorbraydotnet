FROM mcr.microsoft.com/devcontainers/javascript-node

SHELL ["/bin/bash", "-c"]
ENV USERNAME="node"

COPY ./docker-scripts/* ./scripts/
RUN chmod +x ./scripts/*.sh
RUN ./scripts/upgrade-packages.sh
RUN ./scripts/bun.sh
RUN ./scripts/playwright.sh

COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [ "sleep", "infinity" ]
