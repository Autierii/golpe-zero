#!/bin/bash
# Executado DENTRO da VM pelo GitHub Actions via `az vm run-command create`.
# Parâmetros (variáveis de ambiente):
#   TAG         - SHA do commit (tag das imagens no GHCR)
#   GHCR_USER   - usuário do GitHub que publicou as imagens
#   GHCR_TOKEN  - (parâmetro PROTEGIDO) GITHUB_TOKEN do job, só leitura de pacotes,
#                 expira quando o job termina; não aparece no portal nem nos logs.
set -euo pipefail
cd /opt/golpe-zero

for i in $(seq 1 60); do [ -f /var/lib/golpe-zero-pronto ] && break; echo "aguardando cloud-init..."; sleep 10; done

REPO=$(grep '^GITHUB_REPO=' .env | cut -d= -f2)
BASE="https://raw.githubusercontent.com/${REPO}/${TAG}"
curl -fsSL "${BASE}/docker-compose.yml" -o docker-compose.yml
curl -fsSL "${BASE}/deploy/Caddyfile" -o deploy/Caddyfile

# fixa a versão a ser executada
sed -i "s/^TAG=.*/TAG=${TAG}/" .env

echo "${GHCR_TOKEN}" | docker login ghcr.io -u "${GHCR_USER}" --password-stdin >/dev/null
trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT

docker compose pull --quiet
docker compose up -d --no-build --remove-orphans
docker image prune -af --filter "until=72h" >/dev/null || true

echo "== containers =="
docker compose ps --format "table {{.Service}}\t{{.Image}}\t{{.Status}}"
