# Grafana com datasource, dashboard dos 4 sinais de ouro e regras de alerta
# já provisionados. Roda como o usuário grafana (UID 472), não root.
FROM grafana/grafana:13.2
LABEL org.opencontainers.image.title="golpe-zero-grafana"
COPY provisioning/ /etc/grafana/provisioning/
COPY dashboards/ /var/lib/grafana/dashboards/
ENV GF_USERS_ALLOW_SIGN_UP=false \
    GF_ANALYTICS_REPORTING_ENABLED=false \
    GF_ANALYTICS_CHECK_FOR_UPDATES=false \
    GF_SECURITY_COOKIE_SECURE=true \
    GF_SECURITY_DISABLE_GRAVATAR=true \
    GF_SECURITY_CONTENT_SECURITY_POLICY=true \
    GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH=/var/lib/grafana/dashboards/golpe-zero.json \
    GF_SERVER_SERVE_FROM_SUB_PATH=true \
    GF_SERVER_ROOT_URL=%(protocol)s://%(domain)s/grafana/
USER 472
