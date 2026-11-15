"""Métricas de negócio e de falha do Golpe Zero (Prometheus).

As métricas HTTP (tráfego, latência e erros por rota) vêm do
prometheus-fastapi-instrumentator, ligado em src/main.py. Aqui ficam as
métricas que só a aplicação conhece. Nenhuma métrica carrega texto da
mensagem, telefone, chave Pix ou qualquer dado pessoal (LGPD).
"""

from typing import Any

from prometheus_client import Counter, Histogram

VEREDITOS = Counter(
    "golpezero_vereditos_total",
    "Vereditos devolvidos ao cidadão, por tipo e rota de entrada.",
    ["veredito", "rota"],
)

FALHAS_LLM = Counter(
    "golpezero_falhas_llm_total",
    "Análises em que o Ollama não respondeu (timeout, fora do ar, JSON inválido).",
    ["rota"],
)

LATENCIA_ANALISE = Histogram(
    "golpezero_latencia_analise_segundos",
    "Tempo da análise de IA (busca vetorial + LLM), sem contar a rede.",
    ["etapa"],
    buckets=(0.05, 0.25, 1, 2.5, 5, 10, 20, 30, 45, 60, 90, 120),
)


def registrar_resultado(res: dict[str, Any], rota: str) -> None:
    """Registra o resultado de uma análise nas métricas, sem dados pessoais."""
    veredito = str(res.get("veredito", "nao_consta"))
    if veredito not in {"golpe", "legitimo", "suspeito", "nao_consta"}:
        veredito = "outro"
    VEREDITOS.labels(veredito=veredito, rota=rota).inc()

    if res.get("tipo_golpe") == "erro_inferencia" or res.get("_conformidade_json") is False:
        FALHAS_LLM.labels(rota=rota).inc()

    etapa = "etapa1_filtro" if str(res.get("_etapa_decisao", "")).startswith("Etapa 1") else "etapa2_llm"
    try:
        LATENCIA_ANALISE.labels(etapa=etapa).observe(float(res.get("_latencia_seg", 0.0)))
    except (TypeError, ValueError):
        pass
