# syntax=docker/dockerfile:1.7
# Frontend estático do Golpe Zero servido por nginx sem privilégios (UID 101, porta 8080).
FROM nginxinc/nginx-unprivileged:1.31-alpine
LABEL org.opencontainers.image.title="golpe-zero-frontend"
# remove a página padrão e aplica a config endurecida
USER root
RUN rm -f /etc/nginx/conf.d/default.conf && apk upgrade --no-cache
COPY nginx.conf /etc/nginx/conf.d/golpe-zero.conf
COPY --chown=101:101 public/ /usr/share/nginx/html/
USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
