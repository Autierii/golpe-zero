"""Ponto de entrada de produção da API Golpe Zero.

Reaproveita a API da disciplina de Generative AI (src/api.py) sem mudar o
contrato e acrescenta o que a produção exige:
- /metrics no formato Prometheus (4 sinais de ouro);
- /healthz leve, para o healthcheck do container (não chama o Ollama).
O /metrics fica bloqueado na internet pelo Caddy e só é lido com token.
"""

import time

from prometheus_fastapi_instrumentator import Instrumentator

from src.api import app
from src.observabilidade import VEREDITOS

# Buckets largos: a análise com LLM leva de 0,01 s (filtro) a ~60 s (CPU).
BUCKETS_LATENCIA = (0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 20, 30, 45, 60, 90, 120)

Instrumentator(
    should_group_status_codes=False,
    should_instrument_requests_inprogress=True,  # saturação: requisições em andamento
    inprogress_labels=True,
    excluded_handlers=["/metrics", "/healthz"],
).instrument(
    app,
    latency_lowr_buckets=BUCKETS_LATENCIA,
    latency_highr_buckets=BUCKETS_LATENCIA,
).expose(app, endpoint="/metrics", include_in_schema=False)


INICIO = time.time()


@app.get("/api/estatisticas", tags=["Monitoramento"])
def estatisticas() -> dict:
    """Contagens agregadas de vereditos desde a última subida (sem dado pessoal)."""
    por_veredito: dict[str, int] = {}
    for metrica in VEREDITOS.collect():
        for amostra in metrica.samples:
            if amostra.name.endswith("_total"):
                v = amostra.labels.get("veredito", "outro")
                por_veredito[v] = por_veredito.get(v, 0) + int(amostra.value)
    total = sum(por_veredito.values())
    return {
        "analises": total,
        "por_veredito": por_veredito,
        "percentual_golpe": round(100 * por_veredito.get("golpe", 0) / total, 1) if total else 0.0,
        "desde_epoch": int(INICIO),
    }


@app.get("/healthz", include_in_schema=False)
def healthz() -> dict[str, str]:
    """Liveness: o processo responde. Não depende do Ollama."""
    return {"status": "ok"}
