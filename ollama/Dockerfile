# syntax=docker/dockerfile:1.7
# Ollama rodando como usuário comum. A imagem oficial roda como root; aqui
# criamos o usuário 10002 e os modelos ficam num volume (/models), baixados
# na primeira subida pelo entrypoint — a imagem não carrega os 2 GB do modelo.
FROM ollama/ollama:0.40.16
LABEL org.opencontainers.image.title="golpe-zero-ollama"
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/* \
 && groupadd --system --gid 10002 ollama \
 && useradd --system --uid 10002 --gid ollama --home-dir /models --shell /usr/sbin/nologin ollama \
 && mkdir -p /models && chown ollama:ollama /models
COPY --chmod=0755 entrypoint.sh /usr/local/bin/entrypoint.sh
ENV OLLAMA_MODELS=/models OLLAMA_HOST=0.0.0.0:11434 HOME=/models \
    OLLAMA_KEEP_ALIVE=-1 OLLAMA_NUM_PARALLEL=1 OLLAMA_MAX_LOADED_MODELS=1 \
    OLLAMA_MODEL=qwen2.5:3b
USER 10002:10002
EXPOSE 11434
HEALTHCHECK --interval=30s --timeout=5s --start-period=600s --retries=3 \
  CMD ollama list | grep -q "${OLLAMA_MODEL%%:*}" || exit 1
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
