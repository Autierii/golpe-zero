# Estimativa de custo (Azure, preços públicos de varejo, nov/2026)

Fonte: [Azure Retail Prices API](https://prices.azure.com/api/retail/prices), região East US 2, Linux, sob demanda.

| Recurso | SKU | Preço | Por mês (730 h) | Período da GS* |
|---|---|---|---|---|
| VM | Standard_D4as_v5 (4 vCPU, 16 GB) | US$ 0,172/h | US$ 125,56 | US$ 49,50 |
| Disco do SO | StandardSSD E6, 64 GB | ~US$ 4,80/mês | US$ 4,80 | US$ 1,90 |
| IP público | Standard estático | US$ 0,005/h | US$ 3,65 | US$ 1,44 |
| Storage do state | Standard LRS, < 1 MB | ~US$ 0,01 | US$ 0,01 | US$ 0,01 |
| Banda de saída | < 5 GB (grátis até 100 GB) | — | US$ 0 | US$ 0 |
| GHCR, GitHub Actions | repositório público | grátis | US$ 0 | US$ 0 |
| **Total** | | | **≈ US$ 134/mês** | **≈ US$ 53** |

\* De 15/11 até 26/11 (fim da correção), 12 dias × 24 h = 288 h. Cabe nos **US$ 100 do Azure for Students**.

## Por que esse tamanho de VM

O gargalo é a LLM rodando em CPU. O Qwen 2.5:3B em 4 bits ocupa cerca de 2,5 GB de RAM. A API, com torch, sentence-transformers e YOLO, ocupa cerca de 1,5 GB, e o restante da stack cerca de 1 GB.

| VM | RAM | US$/h | Resposta típica da LLM | Veredito |
|---|---|---|---|---|
| D2as_v5 | 8 GB | 0,086 | ~40–60 s | Cabe, mas fica no limite do timeout |
| **D4as_v5** | 16 GB | 0,172 | ~10–25 s | **Escolhida** |
| D4as_v5 em Brazil South | 16 GB | 0,276 | igual | +60% de custo (opção para dados no Brasil) |

## Controles de custo no código

- **Budget** no RG de produção (`infra/bootstrap`), com e-mail em 50% e em 80% do previsto.
- **Desligar fora do horário** (economiza cerca de 65%): `az vm deallocate -g rg-golpezero-prod -n vm-golpezero`. Para religar: `az vm start ...`. O IP é estático, então a URL não muda.
- **Destruir tudo depois da correção:** `terraform destroy` em `infra/` e depois em `infra/bootstrap/`.

## Em escala (modelo B2B2C)

Com 10 mil análises por dia, a CPU vira o limite. O próximo passo é uma VM com GPU T4 (NC4as_T4_v3, cerca de US$ 0,53/h) atendendo de 20 a 50 vezes mais pedidos, ou um modelo menor (Qwen 2.5:1.5B) para as perguntas simples. O filtro da Etapa 1 já responde sem LLM tudo o que está fora do domínio.
