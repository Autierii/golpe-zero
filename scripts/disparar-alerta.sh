#!/usr/bin/env bash
# Demonstração de alerta (evidência para a disciplina):
#   1. derruba o Ollama na VM (via az vm run-command; sem SSH);
#   2. manda mensagens -> a API responde em modo degradado e conta falhas de LLM;
#   3. o alerta "Taxa de erro acima de 5%" dispara no Grafana em ~1-2 min;
#   4. sobe o Ollama de novo -> o alerta volta para Normal.
# Uso: ./scripts/disparar-alerta.sh https://<fqdn>
set -euo pipefail
URL="${1:?informe a URL do MVP}"
RG="${RG:-rg-golpezero-prod}"; VM="${VM:-vm-golpezero}"

echo ">> parando o Ollama na VM..."
az vm run-command invoke -g "$RG" -n "$VM" --command-id RunShellScript \
  --scripts "cd /opt/golpe-zero && docker compose stop ollama" --query "value[0].message" -o tsv

echo ">> enviando mensagens durante 3 minutos (abra o Grafana > Alerting)..."
fim=$(( $(date +%s) + 180 ))
while [ "$(date +%s)" -lt "$fim" ]; do
  curl -s -o /dev/null -w "%{http_code} " -X POST "$URL/api/analisar/texto" -H "Content-Type: application/json" \
    -d '{"texto": "Aqui é da central do banco, informe o código que chegou por SMS para cancelar a compra."}' || true
  sleep 5
done
echo

read -r -p ">> Tirou o print do alerta FIRING? Enter para religar o Ollama... " _
az vm run-command invoke -g "$RG" -n "$VM" --command-id RunShellScript \
  --scripts "cd /opt/golpe-zero && docker compose start ollama" --query "value[0].message" -o tsv
echo ">> Ollama de volta. Em alguns minutos o alerta volta para Normal (print da resolução)."
