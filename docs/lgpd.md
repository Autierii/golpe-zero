# LGPD — onde ficam (e onde NÃO ficam) os dados pessoais

## Mapa dos dados

| Dado | Onde passa | Onde fica guardado | Por quanto tempo | Base legal / medida |
|---|---|---|---|---|
| Texto da mensagem suspeita | navegador → Caddy (TLS) → API → Ollama | **Em lugar nenhum.** Só na memória durante a análise | segundos | Minimização (art. 6º, III): o texto é processado e descartado |
| Print ou foto da tela | navegador (já comprimido) → API → YOLO | **Em lugar nenhum.** O código de produção usa `salvar_anotada=False` e o nome do arquivo não é ecoado | segundos | Minimização e segurança (art. 46) |
| IP do usuário | Caddy | log do container, **mascarado** (/16 no IPv4) e com rotação de 3 × 10 MB | dias | Segurança da operação (legítimo interesse) |
| Query string, cookies e Authorization | Caddy | **Removidos do log** pelo filtro do Caddyfile | — | Minimização |
| Métricas (contagem de vereditos e latência) | Prometheus | volume da VM | 15 dias | **Não são dado pessoal**: só contagens por tipo, sem texto, telefone ou chave Pix |
| Telefone ou chave Pix do golpista (denúncias, Big Data e RPA) | pipeline de dados | Databricks | — | Entram **com hash**, conforme as disciplinas de Big Data e RPA |

## Medidas técnicas que a produção garante

- **Criptografia em trânsito:** HTTPS obrigatório (Let's Encrypt), HSTS e TLS 1.2+ no Storage do state.
- **Criptografia em repouso:** disco gerenciado da Azure (SSE) e Storage com criptografia de infraestrutura.
- **Sem segredos no Git:** Gitleaks a cada push, `.env` e `*.tfvars` no `.gitignore`, segredos gerados pelo Terraform e login na nuvem por OIDC.
- **Acesso mínimo:** nenhuma porta de administração aberta. O deploy roda por `run-command`, auditado.
- **Transparência:** o rodapé do app avisa "Seu print é analisado e apagado na hora".

## Transferência internacional

A VM fica em North Central US (EUA), porque a política da assinatura da FIAP só libera regiões fora do Brasil. Como nenhum dado pessoal é **armazenado**, só processado em memória por segundos, o risco é baixo. A Microsoft oferece cláusulas contratuais padrão (art. 33, II). **Para produção real com bancos e prefeituras**, a recomendação é mudar `location = "brazilsouth"` no Terraform: é uma variável só, cerca de 60% mais cara.
