// Painel "Golpes em números": dados públicos com fonte + estatísticas ao vivo do app.
import { h, s, trocar, num } from "../dom.js";
import { icone } from "../icones.js";
import { DADOS } from "../conteudo.js";

export function telaPainel(raiz) {
  const b = DADOS.brasil, sp = DADOS.sp;
  const pctIdososSP = (100 * sp.idosos) / sp.populacao;
  const pctIdososCap = (100 * sp.capitalIdosos) / sp.capitalPopulacao;
  const base2018 = Math.round(b.estelionatos2025 / (1 + b.crescimentoDesde2018 / 100));

  const aoVivo = h("div", { class: "grade-3" }, kpiCarregando(), kpiCarregando(), kpiCarregando());

  trocar(raiz,
    h("section", { class: "hero" },
      h("div", {},
        h("span", { class: "rotulo-secao" }, icone("grafico", { width: 16, height: 16 }), "Golpes em números"),
        h("h1", {}, "O golpe virou o crime que mais cresce"),
        h("p", {}, "Números oficiais mostram o tamanho do problema e por que começamos por São Paulo. Cada número tem a fonte ao lado."))),

    h("div", { class: "grade-4" },
      kpi("destaque", num(b.estelionatos2025), "boletins de estelionato no Brasil em 2025", b.fonte),
      kpi("coral", `+${num(b.crescimentoDesde2018, 1)}%`, "de crescimento desde 2018", b.fonte),
      kpi("", num(b.porHora), "golpes registrados por hora", "Cálculo: total de 2025 ÷ 8.760 horas"),
      kpi("", h("span", {}, num(b.vitimas2025 / 1e6, 1), h("small", {}, " mi")), `de pessoas (${num(b.percentualPopulacao, 1)}% dos maiores de 16) sofreram golpe ou perderam dinheiro em 2025`, "Fórum Brasileiro de Segurança Pública")),

    h("div", { class: "grade-2", style: "margin-top:1.5rem" },
      h("div", { class: "cartao grafico" },
        h("h2", { style: "font-size:1.2rem" }, "Estelionatos registrados no Brasil"),
        h("p", { class: "nota" }, "Boletins de ocorrência por ano"),
        graficoBarrasVerticais([["2018", base2018, "#9fb3ef"], ["2025", b.estelionatos2025, "#1e4fd8"]]),
        h("p", { class: "nota" }, `2018 calculado a partir do crescimento de ${num(b.crescimentoDesde2018, 1)}% informado no ${b.fonte}.`)),
      h("div", { class: "pilha" },
        kpi("destaque", h("span", {}, num(sp.idosos / 1e6, 2), h("small", {}, " mi")), `pessoas com 60+ no estado de SP (${num(pctIdososSP, 1)}% da população)`, sp.fonte),
        kpi("", h("span", {}, num(sp.capitalIdosos / 1e6, 2), h("small", {}, " mi")), `com 60+ só na cidade de São Paulo (${num(pctIdososCap, 1)}%), onde o Golpe Zero começa`, sp.fonte),
        h("div", { class: "cartao" },
          h("strong", {}, "Por que os idosos?"),
          h("p", { class: "nota", style: "margin:.4rem 0 0" }, "Em número absoluto, a maior parte das vítimas tem entre 30 e 50 anos. Os idosos são os mais ", h("strong", {}, "vulneráveis"), ": têm menos familiaridade com o digital e mais dificuldade de recuperar o dinheiro.")))),

    h("div", { class: "grade-2", style: "margin-top:1.5rem" },
      h("div", { class: "cartao grafico" },
        h("h2", { style: "font-size:1.2rem" }, "Pessoas com 60+ no estado de SP, por idade"),
        h("p", { class: "nota" }, sp.fonte),
        graficoBarrasHorizontais(sp.faixas, "#1e4fd8")),
      h("div", { class: "cartao grafico" },
        h("h2", { style: "font-size:1.2rem" }, "O que o Golpe Zero conhece"),
        h("p", { class: "nota" }, "Trechos oficiais na base de conhecimento, por tema (Febraban, Banco Central, CERT.br, Procon-SP, SSP-SP)"),
        graficoBarrasHorizontais(DADOS.base, "#e2553f"))),

    h("section", { class: "cartao", style: "margin-top:1.5rem" },
      h("div", { style: "display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap" },
        h("div", {}, h("span", { class: "ao-vivo" }, "Ao vivo"), h("h2", { style: "font-size:1.3rem;margin-top:.3rem" }, "Golpe Zero em uso")),
        h("a", { class: "botao botao-claro", href: "/grafana/", target: "_blank", rel: "noopener" }, icone("grafico"), "Monitoramento técnico")),
      h("p", { class: "nota" }, "Contagem desde a última atualização do sistema. Só números: nenhuma mensagem é guardada."),
      aoVivo));

  carregarAoVivo(aoVivo);
}

function kpi(variante, numero, legenda, fonte) {
  return h("div", { class: `cartao kpi ${variante}` },
    h("div", { class: "numero" }, numero), h("p", { class: "legenda" }, legenda), fonte ? h("span", { class: "fonte" }, "Fonte: ", fonte) : null);
}
function kpiCarregando() { return kpi("", "…", "carregando", null); }

async function carregarAoVivo(alvo) {
  try {
    const r = await fetch("/api/estatisticas", { cache: "no-store" });
    if (!r.ok) throw new Error();
    const d = await r.json();
    const desde = new Date(d.desde_epoch * 1000).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    trocar(alvo,
      kpi("", num(d.analises), "mensagens analisadas", `desde ${desde}`),
      kpi("coral", `${num(d.percentual_golpe, 1)}%`, "classificadas como golpe", null),
      kpi("", num((d.por_veredito.nao_consta || 0) + (d.por_veredito.legitimo || 0)), "sem golpe identificado (seguro ou não consta)", null));
  } catch {
    trocar(alvo, h("p", { class: "nota" }, "Não foi possível carregar as estatísticas agora."));
  }
}

// ---------------- gráficos SVG ----------------
function graficoBarrasVerticais(dados) {
  const W = 420, H = 230, base = 190, alt = 150;
  const max = Math.max(...dados.map((d) => d[1]));
  const larg = 110, gap = (W - dados.length * larg) / (dados.length + 1);
  return s("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": dados.map((d) => `${d[0]}: ${num(d[1])}`).join("; ") },
    s("line", { class: "eixo", x1: 10, x2: W - 10, y1: base, y2: base }),
    dados.map(([rot, v, cor], i) => {
      const x = gap + i * (larg + gap), hh = (v / max) * alt;
      return s("g", {},
        s("rect", { x, y: base - hh, width: larg, height: hh, rx: 10, fill: cor }),
        s("text", { x: x + larg / 2, y: base - hh - 8, "text-anchor": "middle", class: "barra-rotulo" }, num(v)),
        s("text", { x: x + larg / 2, y: base + 20, "text-anchor": "middle" }, rot));
    }));
}

// Barras horizontais em HTML (não SVG): o texto fica no tamanho real da página,
// legível no celular e ampliável pelo A+.
function graficoBarrasHorizontais(dados, cor) {
  const max = Math.max(...dados.map((d) => d[1]));
  return h("ul", { class: "barras", role: "list" },
    dados.map(([rot, v]) => h("li", {},
      h("span", { class: "barras-rotulo" }, rot),
      h("span", { class: "barras-trilho" },
        h("span", { class: "barras-valor", style: `width:${Math.max(2, (100 * v) / max)}%;background:${cor};opacity:${(0.4 + 0.6 * (v / max)).toFixed(2)}` })),
      h("span", { class: "barras-num" }, num(v)))));
}
