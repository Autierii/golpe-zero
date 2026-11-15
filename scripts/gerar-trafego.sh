#!/usr/bin/env bash
# Gera tráfego realista no MVP para popular o dashboard (mensagens de exemplo,
# todas fictícias — nenhum dado pessoal real).
# Uso: ./scripts/gerar-trafego.sh https://golpezero.northcentralus.cloudapp.azure.com [rodadas]
set -euo pipefail
URL="${1:?informe a URL do MVP}"; RODADAS="${2:-10}"
MENSAGENS=(
  "Oi mãe, troquei de número. Preciso de um Pix urgente de R\$ 1.450, depois te explico."
  "Banco: sua conta será bloqueada hoje. Atualize seus dados em http://bit.ly/atualiza-conta"
  "Aqui é da central do banco, um motoboy vai buscar seu cartão para trocar o chip."
  "Compra aprovada no débito de R\$ 32,90 na Padaria Central. Não reconhece? Ligue para o número do verso do cartão."
  "Receita de bolo de fubá: 3 ovos, 2 xícaras de fubá e 1 de açúcar."
  "Parabéns! Você ganhou um prêmio de R\$ 5.000. Pague a taxa de liberação via Pix."
)
for r in $(seq 1 "$RODADAS"); do
  for m in "${MENSAGENS[@]}"; do
    code=$(curl -s -o /dev/null -w "%{http_code} %{time_total}s" -X POST "$URL/api/analisar/texto" \
      -H "Content-Type: application/json" --max-time 150 \
      -d "{\"texto\": \"$m\", \"arquitetura\": \"agente\"}")
    echo "rodada $r: $code"
  done
  curl -s -o /dev/null -X POST "$URL/api/analisar/texto" -H "Content-Type: application/json" -d '{"texto": "   "}' # 400 proposital
done
