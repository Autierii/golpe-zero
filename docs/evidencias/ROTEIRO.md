# Evidências da entrega

Os prints (`.jpg`) e as saídas de comando (`.txt`) desta pasta entram no PDF de entrega, gerado com `python scripts/gerar_pdf_entrega.py` em `docs/Entrega-SecureDevOps-GolpeZero.pdf`.

| # | Arquivo(s) | O que comprova | Critério |
|---|---|---|---|
| 01 | `01-mvp-a-mensagem.jpg`, `01-mvp-b-veredito.jpg` | App na URL pública analisando o golpe do falso parente: "É GOLPE", próximo passo, sinais e fonte | Geral |
| 02 | `02-compose-ps.txt` | Os 7 serviços saudáveis na VM. Só o Caddy publica 80/443. Todos com `cap_drop=ALL` e `no-new-privileges` | Container |
| 03 | `03-nao-root.txt` | Checagem do pipeline: o USER de cada imagem (10001, 101, 10002, 472, 65534) | Container |
| 04 | `04-nsg-regras.txt` | NSG: só 80/443 e `negar-todo-o-resto`. A porta 22 não abre | IaC |
| 05 | `05-state-remoto.txt` | State no Storage (sem chave compartilhada, TLS 1.2) e `*.tfstate`/`*.tfvars` ignorados pelo Git | IaC |
| 06 | `06-infra-terraform-apply.jpg` | Workflow **infra** verde (terraform apply via OIDC) | IaC |
| 07 | `07-barrado-a-semgrep.*`, `07-barrado-b-metrics-exposto.*` | Duas execuções **barradas** reais: o Semgrep no Terraform e o teste de segurança pós-deploy | Pipeline |
| 08 | `08-corrigido-deploy-verde.jpg`, `08-corrigido.txt` | Execução **corrigida**: verde, com deploy e testes de segurança passando | Pipeline |
| 09 | `09-secrets.txt` | Secrets do environment `producao` (só os nomes) e login por OIDC | Pipeline |
| 10 | `10-trivy.txt` | Trivy nas 5 imagens: 0 CRITICAL | Pipeline |
| 11 | `11-dashboard-a-sinais.jpg`, `11-dashboard-b-impacto.jpg` | Grafana com os 4 sinais de ouro e os indicadores de impacto | Observabilidade |
| 12 | `12-alerta-firing.jpg` | Alerta "Taxa de erro acima de 5%" em **Firing** (Ollama parado de propósito) | Observabilidade |
| 13 | `13-alerta-historico-normal.jpg` | Histórico do alerta: Pending → Alerting → Normal | Observabilidade |
| 15 | `15-metrics-bloqueado.txt` | Teste feito da internet: `/metrics` dá 404, cabeçalhos de segurança presentes e HTTP vira HTTPS | Segurança |
