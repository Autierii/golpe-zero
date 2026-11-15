# Modelo de responsabilidade compartilhada (IaaS na Azure)

O Golpe Zero usa **IaaS** (uma máquina virtual). Nesse modelo a Azure cuida da parte física e do hipervisor, e a equipe cuida de tudo do sistema operacional para cima.

| Camada | Azure | Equipe Golpe Zero | Como a equipe cumpre |
|---|:---:|:---:|---|
| Datacenter, energia, rede física | ✅ | | — |
| Hardware e hipervisor | ✅ | | Trusted Launch (Secure Boot e vTPM) ligado no Terraform |
| Rede virtual (NSG, IP público) | plataforma | **configuração** | NSG libera só 80/443, com negação explícita de todo o resto, e a porta 22 fica fechada |
| Sistema operacional da VM | imagem base | **patches e hardening** | `unattended-upgrades`, SSH desligado no cloud-init e Docker com `no-new-privileges` |
| Containers e imagens | | ✅ | Usuários não-root, multi-stage, sem segredo na imagem e Trivy barrando CVE crítica |
| Código da aplicação | | ✅ | Semgrep (SAST) e Gitleaks a cada push |
| Identidade e acesso | Entra ID | **quem tem qual papel** | OIDC, Contributor só no RG de produção e Blob Data Contributor só no state |
| Dados (prints e mensagens) | criptografia do disco | **classificação e retenção** | O print não é gravado, os logs não têm texto e as métricas não têm dado pessoal. Ver [LGPD](lgpd.md) |
| Segredos | Storage cifrado | ✅ | Gerados pelo Terraform, guardados no state remoto e no `.env` modo 600 da VM, nunca no Git |
| Monitoramento | Activity Log, boot diagnostics | ✅ | Prometheus, Grafana e alertas dos 4 sinais de ouro |
| Custo | faturamento | ✅ | Budget com alerta em 50% e 80% (previsto) e VM dimensionada no Terraform |

**Resumo:** se alguém invadir a VM por uma falha do Ubuntu sem patch ou por um container mal configurado, a culpa é nossa, não da Azure. Por isso o pipeline barra a imagem vulnerável antes de ela chegar ao cidadão.
