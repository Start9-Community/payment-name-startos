# This package runs no server. Its work is done by a StartOS health check in the
# JS runtime, and this image only gives the daemon something to be.
FROM debian:trixie-slim
ENTRYPOINT ["sleep", "infinity"]
