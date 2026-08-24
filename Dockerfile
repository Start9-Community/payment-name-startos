# This package runs no server. Its work is done by StartOS health checks in the
# JS runtime: resolve a DNS record, compare it to what the user published. The
# container exists only to give the service something to "be running".
FROM debian:trixie-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/*
ENTRYPOINT ["sleep", "infinity"]
