"""Gera o PDF único de entrega da disciplina (links clicáveis + evidências).

Uso:  python scripts/gerar_pdf_entrega.py
Saída: docs/Entrega-SecureDevOps-GolpeZero.pdf
Lê os prints de docs/evidencias/NN-*.png (ver ROTEIRO.md) e o diagrama
docs/arquitetura.png, se existirem. Requer: pip install fpdf2
"""

from pathlib import Path

from fpdf import FPDF
from fpdf.enums import XPos, YPos

RAIZ = Path(__file__).resolve().parent.parent
EVID = RAIZ / "docs" / "evidencias"
SAIDA = RAIZ / "docs" / "Entrega-SecureDevOps-GolpeZero.pdf"

URL = "https://golpezero.northcentralus.cloudapp.azure.com"
REPO = "https://github.com/Autierii/golpe-zero"
LINKS = [
    ("MVP no ar", URL),
    ("Dashboard Grafana (sem login, só leitura)", f"{URL}/grafana/"),
    ("API (Swagger)", f"{URL}/docs"),
    ("Repositório (Dockerfile, workflow, Terraform)", REPO),
    ("Pipeline DevSecOps (execuções)", f"{REPO}/actions/workflows/devsecops.yml"),
    ("Pipeline de infraestrutura (Terraform)", f"{REPO}/actions/workflows/infra.yml"),
    ("Arquitetura", f"{REPO}/blob/main/docs/arquitetura.md"),
    ("Responsabilidade compartilhada", f"{REPO}/blob/main/docs/responsabilidade-compartilhada.md"),
    ("LGPD: onde ficam os dados pessoais", f"{REPO}/blob/main/docs/lgpd.md"),
    ("Estimativa de custo", f"{REPO}/blob/main/docs/custo.md"),
    ("Repositório de IA (GenAI + Visão)", "https://github.com/rcm2005/golpe-zero-gs"),
]
INTEGRANTES = [
    ("Levy Nascimento Junior", "98655"),
    ("Rafael Autieri dos Anjos", "550885"),
    ("Allan Von Ivanov", "98705"),
    ("Luiza Cristina Silva", "99367"),
    ("Rafael Carvalho Mattos", "99874"),
]
# (seção, critério, texto, prints)
SECOES = [
    ("1. Container e IaC (5,0)", [
        ("Container (2,0)",
         "Três Dockerfiles próprios (api, frontend, ollama) e dois de observabilidade. Multi-stage na API "
         "(torch CPU, cache do pip fora da imagem final), usuários não-root (10001, 101, 10002, 472, 65534), "
         "sem segredo na imagem (tudo vem do .env da VM), healthcheck, read-only, cap_drop ALL e "
         "no-new-privileges. O pipeline falha se alguma imagem rodar como root. A stack inteira sobe com "
         "docker compose, o mesmo arquivo no PC e na VM.",
         ["02", "03"]),
        ("IaC (3,0)",
         "Terraform em duas camadas: o bootstrap cria o Storage Account do state (só Entra ID, versionado), o "
         "RG de produção e a identidade OIDC do GitHub; a camada de produção cria VNet, NSG, IP com DNS e a VM "
         "Ubuntu 24.04 com Trusted Launch. State remoto (backend azurerm); *.tfstate, *.tfvars e backend.hcl "
         "ficam no .gitignore. O NSG libera só 80/443 e nega todo o resto: a porta 22 nunca é aberta, nem para "
         "0.0.0.0/0 nem para IP nenhum. A administração é por az vm run-command (Entra ID e Activity Log).",
         ["04", "05", "06"]),
    ]),
    ("2. Pipeline DevSecOps (4,0)", [
        ("Etapas a cada push",
         "Gitleaks (histórico inteiro), Semgrep (Python, Dockerfile, Terraform, JS), Terraform validate, Trivy "
         "config, build das 5 imagens, checagem de não-root, Trivy na imagem (CRITICAL corrigível barra), "
         "push no GHCR, deploy automático por OIDC + run-command e smoke test na URL pública. Os IDs da Azure "
         "ficam em GitHub Secrets do environment 'producao', restrito à branch main. Não existe senha da "
         "nuvem: o login é federado (OIDC). As actions são fixadas por SHA.",
         ["09", "10"]),
        ("Execuções barradas e corrigidas (duas, reais)",
         "1) Primeira execução do pipeline: o Semgrep barrou o Terraform do bootstrap "
         "(storage-queue-services-logging: Storage do state sem log de auditoria). O build nem começou. O commit "
         "seguinte ligou o logging e o pipeline passou. "
         "2) O teste de segurança pós-deploy (que roda contra a URL pública) barrou o deploy #6: /metrics e "
         "/node-metrics respondiam sem token por causa de uma configuração antiga no container do Caddy. O "
         "deploy.sh passou a reiniciar o Caddy quando o Caddyfile muda, e a execução #7 ficou verde, com 404 "
         "sem token.",
         ["07", "08"]),
    ]),
    ("3. Observabilidade (3,0)", [
        ("4 sinais de ouro",
         "Prometheus e Grafana na VM, provisionados por código. Latência p50/p95/p99 das análises; tráfego "
         "(req/s por rota); erros (% 5xx e % de análises em que a LLM falhou); saturação (CPU, memória e disco "
         "da VM via node-exporter e requisições em andamento). Também mostra os indicadores de impacto: "
         "mensagens analisadas e % classificado como golpe.",
         ["11"]),
        ("Alerta disparado",
         "Três alertas provisionados: MVP fora do ar, taxa de erro > 5% e p95 > 45 s. Demonstração: "
         "scripts/disparar-alerta.sh para o Ollama na VM; a API responde em modo degradado, as falhas de LLM "
         "sobem e o alerta 'Taxa de erro acima de 5%' vai para Firing. Ao religar, volta para Normal.",
         ["12", "13"]),
    ]),
    ("4. Documentação (2,0)", [
        ("Arquitetura, LGPD, custo e responsabilidade compartilhada",
         "Diagrama e decisões em docs/arquitetura.md. Modelo IaaS camada a camada em "
         "docs/responsabilidade-compartilhada.md. LGPD: o texto e o print ficam só em memória (não são "
         "gravados), os logs do Caddy mascaram o IP e removem query string e Authorization, e as métricas não "
         "têm dado pessoal. Custo: cerca de US$ 118/mês, ou cerca de US$ 47 no período da GS (B4as_v2 em North Central "
         "US, únicas permitidas pela política e pela cota da assinatura da FIAP), dentro do crédito Azure for "
         "Students. README com a Ficha Técnica "
         "e o passo a passo para reproduzir do zero. Abaixo, o teste de segurança feito da internet.",
         ["15"]),
    ]),
]


class PDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font("ui", "", 8)
            self.set_text_color(110)
            self.cell(0, 6, "Golpe Zero · Secure DevOps Tools & Cloud Computing · Deploy Blindado",
                      new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            self.set_text_color(0)

    def footer(self):
        self.set_y(-12)
        self.set_font("ui", "", 8)
        self.set_text_color(110)
        self.cell(0, 6, f"{self.page_no()}", align="C")


def fonte(pdf: FPDF) -> None:
    win = Path("C:/Windows/Fonts")
    reg, bold = win / "segoeui.ttf", win / "segoeuib.ttf"
    if not reg.exists():  # Linux/macOS
        reg = bold = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
    pdf.add_font("ui", "", str(reg))
    pdf.add_font("ui", "B", str(bold))
    mono = win / "consola.ttf"
    if not mono.exists():
        mono = Path("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf")
    pdf.add_font("mono", "", str(mono))


def evidencia(pdf: PDF, numero: str) -> None:
    arquivos = sorted(
        [a for a in EVID.glob(f"{numero}-*") if a.suffix.lower() in {".png", ".jpg", ".txt"}],
        key=lambda a: (a.stem, a.suffix != ".txt"),
    )
    if not arquivos:
        pdf.set_font("ui", "", 9)
        pdf.set_text_color(176, 0, 32)
        pdf.multi_cell(0, 5, f"[print {numero} pendente — ver docs/evidencias/ROTEIRO.md]")
        pdf.set_text_color(0)
        return
    for arq in arquivos:
        largura = pdf.w - pdf.l_margin - pdf.r_margin
        if arq.suffix.lower() == ".txt":
            pdf.set_font("mono", "", 6.5)
            pdf.set_fill_color(242, 244, 248)
            texto = arq.read_text(encoding="utf-8-sig").replace("	", "    ")
            pdf.multi_cell(0, 3.2, texto.strip(), fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        else:
            if pdf.get_y() > pdf.h - 110:
                pdf.add_page()
            pdf.image(str(arq), w=largura * 0.85)
        pdf.set_font("ui", "", 8)
        pdf.set_text_color(90)
        pdf.cell(0, 5, arq.name, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_text_color(0)
        pdf.ln(2)


def main() -> None:
    pdf = PDF(format="A4")
    fonte(pdf)
    pdf.set_auto_page_break(True, margin=15)
    pdf.set_margins(18, 15, 18)

    # capa
    pdf.add_page()
    pdf.set_font("ui", "B", 24)
    pdf.ln(20)
    pdf.cell(0, 12, "Golpe Zero", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("ui", "", 14)
    pdf.multi_cell(0, 7, "Deploy Blindado: o MVP no ar com CI/CD, segurança e monitoramento em nuvem")
    pdf.ln(4)
    pdf.set_font("ui", "", 11)
    pdf.multi_cell(0, 6, "FIAP · Global Solution 2026.2 · CitizenTech · Engenharia de Software 4ES\n"
                         "Secure DevOps Tools & Cloud Computing · Prof. Gabriel Henrique Boyczuk Arcanjo")
    pdf.ln(6)
    pdf.set_font("ui", "B", 12)
    pdf.cell(0, 8, "Integrantes", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("ui", "", 11)
    for nome, rm in INTEGRANTES:
        pdf.cell(0, 6, f"{nome} — RM {rm}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(6)
    pdf.set_font("ui", "B", 12)
    pdf.cell(0, 8, "Links (clicáveis)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    for rotulo, url in LINKS:
        pdf.set_font("ui", "", 10)
        pdf.cell(78, 6, rotulo)
        pdf.set_text_color(11, 61, 145)
        pdf.set_font("ui", "", 9)
        pdf.cell(0, 6, url, link=url, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_text_color(0)

    # tela do MVP + arquitetura
    pdf.add_page()
    pdf.set_font("ui", "B", 16)
    pdf.cell(0, 10, "O MVP e a arquitetura", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("ui", "", 10)
    pdf.multi_cell(0, 5, "O idoso cola o texto ou envia o print e recebe o veredito com fonte oficial, o "
                         "próximo passo e leitura em voz alta. Fluxo de produção: internet → NSG (80/443) → Caddy "
                         "(TLS) → frontend / API FastAPI (RAG + YOLO) → Ollama (Qwen 2.5:3B), com Prometheus e "
                         "Grafana na mesma VM. O GitHub Actions publica no GHCR e faz o deploy por OIDC.")
    pdf.ln(2)
    evidencia(pdf, "01")
    diagrama = RAIZ / "docs" / "arquitetura.png"
    if diagrama.exists():
        if pdf.get_y() > pdf.h - 120:
            pdf.add_page()
        pdf.image(str(diagrama), w=pdf.w - 36)

    for titulo, itens in SECOES:
        pdf.add_page()
        pdf.set_font("ui", "B", 16)
        pdf.cell(0, 10, titulo, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        for sub, texto, prints in itens:
            pdf.set_font("ui", "B", 12)
            pdf.cell(0, 8, sub, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.set_font("ui", "", 10)
            pdf.multi_cell(0, 5, texto, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.ln(2)
            for n in prints:
                evidencia(pdf, n)

    pdf.output(str(SAIDA))
    print(f"PDF gerado: {SAIDA}")


if __name__ == "__main__":
    main()
