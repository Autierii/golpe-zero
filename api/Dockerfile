# syntax=docker/dockerfile:1.7
# ---------------------------------------------------------------------------
# Golpe Zero API — imagem de produção
# Estágio 1 (builder): instala dependências num venv e baixa o modelo de
#   embeddings. Compiladores e cache do pip NÃO vão para a imagem final.
# Estágio 2 (runtime): só o venv, o código e os pesos, rodando como não-root.
# Nenhum segredo entra na imagem: tudo vem do ambiente em tempo de execução.
# ---------------------------------------------------------------------------
ARG PYTHON_VERSION=3.12

FROM python:${PYTHON_VERSION}-slim AS builder
ENV PIP_NO_CACHE_DIR=1 PIP_DISABLE_PIP_VERSION_CHECK=1 \
    VIRTUAL_ENV=/opt/venv PATH=/opt/venv/bin:$PATH
RUN python -m venv /opt/venv
WORKDIR /build
COPY requirements.txt .
# torch CPU-only primeiro (evita baixar ~2 GB de bibliotecas CUDA)
RUN pip install --index-url https://download.pytorch.org/whl/cpu torch torchvision \
 && pip install -r requirements.txt
# ultralytics puxa o opencv com GUI (exige libGL); trocamos pelo headless
RUN pip uninstall -y opencv-python \
 && pip install --no-deps --force-reinstall opencv-python-headless==5.0.0.93 \
 && python -c "import cv2, ultralytics, sentence_transformers; print('deps ok', cv2.__version__)"
# Modelo de embeddings baixado no build: o container não precisa de internet
# para iniciar e o startup fica previsível.
ENV HF_HOME=/opt/hf
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

FROM python:${PYTHON_VERSION}-slim AS runtime
LABEL org.opencontainers.image.title="golpe-zero-api" \
      org.opencontainers.image.description="API FastAPI do Golpe Zero (RAG + YOLO)" \
      org.opencontainers.image.licenses="CC-BY-NC-SA-4.0"
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/opt/venv PATH=/opt/venv/bin:$PATH \
    HF_HOME=/opt/hf HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 \
    YOLO_CONFIG_DIR=/tmp/ultralytics VISION_OUTPUT_DIR=/tmp/vision \
    YOLO_OFFLINE=1
# usuário sem privilégios e sem shell de login
RUN groupadd --system --gid 10001 app \
 && useradd --system --uid 10001 --gid app --no-create-home --shell /usr/sbin/nologin app
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /opt/hf /opt/hf
WORKDIR /app
COPY --chown=app:app src/ ./src/
COPY --chown=app:app vision/ ./vision/
COPY --chown=app:app base/ ./base/
USER 10001:10001
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/healthz',timeout=4).status==200 else 1)"
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips=*", "--no-server-header"]
