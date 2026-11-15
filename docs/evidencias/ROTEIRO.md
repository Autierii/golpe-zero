# Roteiro de evidências (prints para o PDF de entrega)

Salve cada print nesta pasta com o nome indicado. O PDF final referencia esses arquivos.

| # | Arquivo | O que mostrar | Critério |
|---|---|---|---|
| 01 | `01-mvp-no-ar.png` | O app aberto na URL pública, com cadeado HTTPS, analisando uma mensagem e mostrando o veredito "É GOLPE" | Geral |
| 02 | `02-compose-ps.png` | Saída do deploy (job "Deploy na Azure") com `docker compose ps`: 7 serviços *healthy/running* | Container |
| 03 | `03-nao-root.png` | Passo "Confere que a imagem não roda como root" com `USER da imagem: '10001:10001'` | Container |
| 04 | `04-nsg.png` | Portal Azure → NSG `nsg-golpezero-app` → regras de entrada: só 80/443 e "negar-todo-o-resto" (sem 22) | IaC |
| 05 | `05-state-remoto.png` | Portal → Storage `stgolpezerotf…` → container `tfstate` com `golpe-zero/prod.tfstate` | IaC |
| 06 | `06-infra-apply.png` | Workflow **infra** verde, com o `terraform apply` e os outputs | IaC |
| 07 | `07-pipeline-barrado.png` | Execução **vermelha**: Gitleaks encontrou a chave de teste (commit "demo: credencial vazada") | Pipeline |
| 08 | `08-pipeline-corrigido.png` | Execução seguinte **verde** (commit "fix: remove credencial"), com deploy e smoke test | Pipeline |
| 09 | `09-secrets.png` | Settings → Environments → `producao` → secrets (nomes, sem valores) | Pipeline |
| 10 | `10-trivy.png` | Artefato ou log do Trivy da imagem da API | Pipeline |
| 11 | `11-dashboard.png` | Grafana com os 4 sinais de ouro preenchidos (depois de rodar `gerar-trafego.sh`) | Observabilidade |
| 12 | `12-alerta-firing.png` | Grafana → Alerting → "Taxa de erro acima de 5%" em **Firing** | Observabilidade |
| 13 | `13-alerta-normal.png` | O mesmo alerta de volta para **Normal** depois de religar o Ollama | Observabilidade |
| 14 | `14-custo.png` | Portal → Cost Management, ou o budget criado | Documentação |
| 15 | `15-metrics-bloqueado.png` | `curl https://…/metrics` sem token devolvendo 404 | Segurança (extra) |
