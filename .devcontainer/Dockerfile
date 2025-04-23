FROM mcr.microsoft.com/devcontainers/javascript-node

COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [ "sleep", "infinity" ]
