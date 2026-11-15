#!/bin/sh
# Sobe o servidor Ollama, garante que o modelo está no volume e deixa-o
# carregado na memória (a primeira resposta não paga o tempo de carga).
set -eu
ollama serve &
PID=$!
until ollama list >/dev/null 2>&1; do sleep 1; done
if ! ollama list | grep -q "^${OLLAMA_MODEL}"; then
  echo "[ollama] baixando ${OLLAMA_MODEL} (só na primeira vez)..."
  ollama pull "${OLLAMA_MODEL}"
fi
echo "[ollama] aquecendo ${OLLAMA_MODEL}..."
ollama run "${OLLAMA_MODEL}" "ok" >/dev/null 2>&1 || true
echo "[ollama] pronto"
wait "$PID"
