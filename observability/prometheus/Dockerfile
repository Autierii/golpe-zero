# Prometheus com a configuração do Golpe Zero embutida (roda como nobody, UID 65534).
FROM prom/prometheus:v3.16.0
LABEL org.opencontainers.image.title="golpe-zero-prometheus"
COPY prometheus.yml /etc/prometheus/prometheus.yml
USER 65534:65534
