# Estimativa de custo (Azure, preços públicos de varejo, nov/2026)

Fonte: [Azure Retail Prices API](https://prices.azure.com/api/retail/prices), região North Central US, Linux, sob demanda.

| Recurso | SKU | Preço | Por mês (730 h) | Período da GS* |
|---|---|---|---|---|
| VM | Standard_B4as_v2 (4 vCPU, 16 GB, burstable) | US$ 0,150/h | US$ 109,50 | US$ 43,20 |
| Disco do SO | StandardSSD E6, 64 GB | ~US$ 4,80/mês | US$ 4,80 | US$ 1,90 |
| IP público | Standard estático | US$ 0,005/h | US$ 3,65 | US$ 1,44 |
| Storage do state | Standard LRS, < 1 MB | ~US$ 0,01 | US$ 0,01 | US$ 0,01 |
| Banda de saída | < 5 GB (grátis até 100 GB) | — | US$ 0 | US$ 0 |
| GHCR, GitHub Actions | repositório público | grátis | US$ 0 | US$ 0 |
| **Total** | | | **≈ US$ 118/mês** | **≈ US$ 47** |

\* De 15/11 até 26/11 (fim da correção), 12 dias × 24 h = 288 h. Cabe nos **US$ 100 do Azure for Students**.

## Por que essa VM e essa região

A assinatura Azure for Students da FIAP tem duas travas, conferidas com `az policy assignment list` e `az vm list-usage`:

1. **Regiões permitidas por política:** spaincentral, canadacentral, italynorth, southafricanorth e northcentralus. Brazil South e East US não podem ser usadas.
2. **Cota por família de VM:** as famílias Dasv5 e Dsv5 têm cota **0**. A família Basv2 tem 10 vCPU liberadas.

Preço da VM de 4 vCPU e 16 GB nas regiões permitidas:

| Região | B4as_v2 (US$/h) |
|---|---|
| **northcentralus** | **0,150** ✅ |
| canadacentral | 0,167 |
| spaincentral | 0,183 |
| italynorth | 0,192 |
| southafricanorth | 0,217 |

O gargalo é a LLM rodando em CPU. O Qwen 2.5:3B em 4 bits ocupa cerca de 2,5 GB de RAM, a API (torch, sentence-transformers e YOLO) cerca de 1,5 GB, e o restante da stack cerca de 1 GB. Com 8 GB a VM ficaria no limite, por isso são 16 GB.

**Por que burstable funciona aqui:** a série B acumula crédito de CPU enquanto está ociosa e gasta nos picos. O uso do Golpe Zero tem exatamente esse perfil: a maior parte do tempo ninguém está analisando, e quando alguém analisa, a LLM usa as 4 vCPU por alguns segundos. O painel "Saturação" do Grafana mostra a CPU. Se os créditos acabarem sob carga contínua, o próximo passo está na seção "Em escala".

## Controles de custo no código

- **Budget** no RG de produção (`infra/bootstrap`), com e-mail em 50% e em 80% do previsto.
- **Desligar fora do horário** (economiza cerca de 65%): `az vm deallocate -g rg-golpezero-prod -n vm-golpezero`. Para religar: `az vm start ...`. O IP é estático, então a URL não muda.
- **Destruir tudo depois da correção:** `terraform destroy` em `infra/` e depois em `infra/bootstrap/`.

## Em escala (modelo B2B2C)

Com 10 mil análises por dia, a CPU vira o limite. O próximo passo é uma VM com GPU T4 (NC4as_T4_v3, cerca de US$ 0,53/h) atendendo de 20 a 50 vezes mais pedidos, ou um modelo menor (Qwen 2.5:1.5B) para as perguntas simples. O filtro da Etapa 1 já responde sem LLM tudo o que está fora do domínio. Numa assinatura comercial, sem as travas de cota, uma D4as_v5 (não burstable) custa US$ 0,172/h.
