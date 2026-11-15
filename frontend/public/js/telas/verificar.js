// Tela principal: colar texto ou mandar print -> veredito com medidor de risco,
// próximo passo, sinais, fonte oficial, leitura em voz alta e aviso à família.
import { h, s, trocar, falar, pararFala, anunciar } from "../dom.js";
import { icone } from "../icones.js";
import { EXEMPLOS, nomeDoGolpe } from "../conteudo.js";
import { botaoAvisarFamilia } from "./familia.js";

const VEREDITOS = {
  golpe:      { classe: "golpe",  risco: 0.93, cor: "#b42318", titulo: "É golpe!",                     sub: "Não faça nada do que a mensagem pede." },
  suspeito:   { classe: "duvida", risco: 0.66, cor: "#c27803", titulo: "Muito suspeito",               sub: "Trate como golpe até confirmar pelo canal oficial." },
  nao_consta: { classe: "duvida", risco: 0.5,  cor: "#c27803", titulo: "Não encontramos esse caso",    sub: "Não está nas fontes oficiais que conhecemos. Na dúvida, não pague e confirme." },
  legitimo:   { classe: "ok",     risco: 0.18, cor: "#1f7a3d", titulo: "Parece seguro",                sub: "Mesmo assim, confirme pelo aplicativo oficial ou pelo número do verso do cartão." },
};

const LIMITE = 4000;

export function telaVerificar(raiz) {
  const estado = { aba: "texto", arquivo: null, urlPrevia: null, enviando: false };

  // ---------------- formulário ----------------
  const texto = h("textarea", {
    id: "texto", maxlength: LIMITE, rows: 6, "aria-describedby": "contador",
    placeholder: "Cole aqui a mensagem que você recebeu no WhatsApp, SMS ou e-mail…",
  });
  const contador = h("div", { class: "contador", id: "contador" }, `0 / ${LIMITE}`);
  texto.addEventListener("input", () => { contador.textContent = `${texto.value.length} / ${LIMITE}`; atualizarBotao(); });

  const exemplos = h("div", { class: "exemplos" }, h("span", {}, "Experimente:"),
    EXEMPLOS.map((ex) => h("button", { type: "button", class: "chip", onclick: () => { texto.value = ex.texto; texto.dispatchEvent(new Event("input")); texto.focus(); } }, ex.rotulo)));

  const painelTexto = h("div", { id: "painel-texto", role: "tabpanel", "aria-labelledby": "aba-texto" },
    h("label", { for: "texto", class: "sr-only" }, "Mensagem recebida"), texto, contador, exemplos);

  const inputArquivo = h("input", { type: "file", accept: "image/*", id: "arquivo", class: "sr-only" });
  const zona = h("label", { for: "arquivo", class: "zona-print" },
    icone("imagem"), h("strong", {}, "Toque para escolher o print"),
    h("span", {}, "ou arraste a imagem para cá. Também dá para colar com Ctrl+V."));
  const previa = h("div", { class: "previa", hidden: true });
  const contexto = h("input", { type: "text", id: "contexto", placeholder: "Opcional: conte o que aconteceu (ex.: recebi no WhatsApp)" });
  const painelPrint = h("div", { id: "painel-print", role: "tabpanel", "aria-labelledby": "aba-print", hidden: true },
    inputArquivo, zona, previa,
    h("div", { style: "margin-top:.8rem" }, h("label", { for: "contexto", class: "campo" }, "Quer contar mais alguma coisa?"), contexto));

  const abaTexto = h("button", { type: "button", role: "tab", id: "aba-texto", "aria-selected": "true", "aria-controls": "painel-texto", onclick: () => trocarAba("texto") }, icone("texto"), "Colar texto");
  const abaPrint = h("button", { type: "button", role: "tab", id: "aba-print", "aria-selected": "false", "aria-controls": "painel-print", onclick: () => trocarAba("print") }, icone("camera"), "Mandar print");

  const enviar = h("button", { type: "submit", class: "botao botao-principal botao-largo botao-gigante", disabled: true }, icone("lupa"), "Verificar agora");
  const form = h("form", { class: "cartao cartao-destaque", novalidate: true },
    h("div", { class: "abas", role: "tablist", "aria-label": "Como você quer mandar a mensagem" }, abaTexto, abaPrint),
    painelTexto, painelPrint,
    h("div", { class: "acoes-form" }, enviar));

  function trocarAba(aba) {
    estado.aba = aba;
    abaTexto.setAttribute("aria-selected", String(aba === "texto"));
    abaPrint.setAttribute("aria-selected", String(aba === "print"));
    painelTexto.hidden = aba !== "texto";
    painelPrint.hidden = aba !== "print";
    atualizarBotao();
  }
  function atualizarBotao() {
    enviar.disabled = estado.enviando || (estado.aba === "texto" ? texto.value.trim().length < 3 : !estado.arquivo);
  }

  function usarArquivo(arq) {
    if (!arq || !arq.type.startsWith("image/")) { anunciar("Escolha uma imagem (foto ou print)."); return; }
    estado.arquivo = arq;
    if (estado.urlPrevia) URL.revokeObjectURL(estado.urlPrevia);
    estado.urlPrevia = URL.createObjectURL(arq);
    trocar(previa,
      h("img", { src: estado.urlPrevia, alt: "Prévia do print escolhido" }),
      h("button", { type: "button", class: "botao-mini", onclick: limparArquivo }, "Trocar imagem"));
    previa.hidden = false; zona.hidden = true;
    atualizarBotao();
    anunciar("Imagem escolhida. Agora toque em Verificar agora.");
  }
  function limparArquivo() {
    estado.arquivo = null; inputArquivo.value = "";
    if (estado.urlPrevia) URL.revokeObjectURL(estado.urlPrevia);
    previa.hidden = true; zona.hidden = false; atualizarBotao();
  }
  inputArquivo.addEventListener("change", () => usarArquivo(inputArquivo.files[0]));
  zona.addEventListener("dragover", (e) => { e.preventDefault(); zona.classList.add("arrastando"); });
  zona.addEventListener("dragleave", () => zona.classList.remove("arrastando"));
  zona.addEventListener("drop", (e) => { e.preventDefault(); zona.classList.remove("arrastando"); usarArquivo(e.dataTransfer.files[0]); });
  const aoColar = (e) => {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
    if (item) { trocarAba("print"); usarArquivo(item.getAsFile()); }
  };
  document.addEventListener("paste", aoColar);
  window.addEventListener("hashchange", () => document.removeEventListener("paste", aoColar), { once: true });

  // ---------------- área de resposta ----------------
  const area = h("section", { "aria-live": "polite", class: "pilha", style: "margin-top:1.25rem" });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (enviar.disabled) return;
    estado.enviando = true; atualizarBotao();
    const parar = mostrarCarregando(area, estado.aba === "print");
    area.scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      const res = await chamarApi(estado, texto.value.trim(), contexto.value.trim());
      parar();
      mostrarResultado(area, res, () => { trocar(area); limparArquivo(); texto.value = ""; texto.dispatchEvent(new Event("input")); window.scrollTo({ top: 0, behavior: "smooth" }); texto.focus(); });
    } catch {
      parar();
      mostrarResultado(area, {
        veredito: "nao_consta", tipo_golpe: "erro_inferencia",
        proximo_passo: "Não conseguimos analisar agora. Enquanto isso: NÃO pague, NÃO clique em links e ligue você mesmo para o número do verso do seu cartão.",
        sinais_encontrados: ["O serviço está instável no momento. Tente de novo em alguns minutos."],
        fonte_oficial: "Febraban — orientação geral",
      }, () => trocar(area));
    } finally {
      estado.enviando = false; atualizarBotao();
    }
  });

  // ---------------- montagem ----------------
  trocar(raiz,
    h("section", { class: "hero" },
      h("div", {},
        h("span", { class: "rotulo-secao" }, icone("escudo", { width: 16, height: 16 }), "Proteção gratuita para 60+"),
        h("h1", {}, "Recebeu uma mensagem estranha?"),
        h("p", {}, "Mande aqui antes de pagar, clicar ou responder. Em segundos você descobre se é golpe, por quê e o que fazer."),
        h("div", { class: "selos" },
          h("span", { class: "selo" }, icone("check"), "Grátis"),
          h("span", { class: "selo" }, icone("check"), "Não guardamos sua mensagem"),
          h("span", { class: "selo" }, icone("check"), "Baseado em Febraban e Banco Central"))),
      h("img", { class: "hero-ilustra", src: "img/logo.svg", alt: "" })),
    h("div", { class: "grade-2" },
      h("div", {}, form, area),
      h("aside", { class: "pilha" },
        h("div", { class: "cartao" },
          h("h2", { style: "font-size:1.2rem" }, "Regras de ouro"),
          h("ul", { class: "dica-lista" },
            dica("cadeado", "Banco nunca pede senha ou código", "Nem por telefone, SMS, e-mail ou WhatsApp."),
            dica("telefone", "Desligue e ligue você", "Use o número do verso do cartão, nunca o que veio na mensagem."),
            dica("relogio", "Pressa é sinal de golpe", "\"Urgente\", \"só hoje\", \"sua conta será bloqueada\"…"),
            dica("familia", "Filho pedindo Pix de número novo?", "Ligue no número antigo antes de qualquer coisa."))),
        h("a", { class: "cartao", href: "#/aprender?caiu", style: "display:flex;gap:.9rem;align-items:center;text-decoration:none;color:inherit" },
          h("span", { class: "dica-icone", style: "background:#fdeee9;color:#e2553f" }, icone("alerta")),
          h("span", {}, h("strong", {}, "Já caiu em um golpe?"), h("br"), h("span", { class: "nota" }, "Veja o passo a passo do que fazer agora →"))))));
}

function dica(ic, titulo, texto) {
  return h("li", {}, h("span", { class: "dica-icone" }, icone(ic)), h("div", {}, h("strong", {}, titulo), h("span", {}, texto)));
}

// ---------------- chamada à API ----------------
async function comprimir(arquivo, ladoMax = 1280, qualidade = 0.72) {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, ladoMax / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((ok) => canvas.toBlob(ok, "image/jpeg", qualidade));
}

async function chamarApi(estado, texto, contexto) {
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), 170000);
  try {
    let resp;
    if (estado.aba === "print") {
      const dados = new FormData();
      dados.append("foto", await comprimir(estado.arquivo), "print.jpg");
      dados.append("texto_adicional", contexto);
      resp = await fetch("/api/analisar/imagem", { method: "POST", body: dados, signal: controle.signal });
    } else {
      resp = await fetch("/api/analisar/texto", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, arquitetura: "agente" }), signal: controle.signal,
      });
    }
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(limite);
  }
}

// ---------------- carregando ----------------
function mostrarCarregando(area, ehPrint) {
  const etapas = [
    ...(ehPrint ? ["Examinando o print"] : ["Lendo a mensagem"]),
    "Procurando sinais de golpe",
    "Comparando com alertas da Febraban e do Banco Central",
    "Escrevendo a resposta em linguagem simples",
  ];
  const itens = etapas.map((t) => h("li", {}, h("span", { class: "bolinha" }), t));
  const tempo = h("p", { class: "nota" }, "0 s");
  trocar(area, h("div", { class: "cartao carregando", role: "status" },
    h("div", { class: "radar" }, icone("lupa")),
    h("h2", { style: "font-size:1.3rem" }, "Analisando com cuidado…"),
    h("p", { class: "nota" }, "Pode levar até 1 minuto. Enquanto isso: não pague, não clique em links e não passe códigos."),
    h("ol", { class: "passos" }, itens), tempo));
  const marcos = [0, 2500, 6000, 11000];
  const t0 = Date.now();
  const timer = setInterval(() => {
    const dt = Date.now() - t0;
    tempo.textContent = `${Math.round(dt / 1000)} s`;
    itens.forEach((li, i) => {
      const proximo = marcos[i + 1] ?? Infinity;
      li.className = dt >= proximo ? "feito" : dt >= marcos[i] ? "agora" : "";
    });
  }, 250);
  return () => clearInterval(timer);
}

// ---------------- resultado ----------------
function medidor(risco, cor) {
  const r = 52, c = Math.PI * r; // meia-lua
  const valor = s("path", { class: "valor", d: "M12 70 A52 52 0 0 1 116 70", stroke: cor, "stroke-dasharray": c, "stroke-dashoffset": c });
  const svg = s("svg", { class: "medidor", viewBox: "0 0 128 100", role: "img", "aria-label": `Risco ${Math.round(risco * 100)} de 100` },
    s("path", { class: "trilho", d: "M12 70 A52 52 0 0 1 116 70" }), valor,
    s("text", { x: 64, y: 96, "text-anchor": "middle" }, risco > 0.8 ? "RISCO ALTO" : risco > 0.4 ? "ATENÇÃO" : "RISCO BAIXO"));
  requestAnimationFrame(() => requestAnimationFrame(() => valor.setAttribute("stroke-dashoffset", String(c * (1 - risco)))));
  return svg;
}

function mostrarResultado(area, res, aoNova) {
  const v = VEREDITOS[res.veredito] || VEREDITOS.nao_consta;
  const tipo = res.tipo_golpe && !["nao_se_aplica", "erro_inferencia"].includes(res.tipo_golpe) ? nomeDoGolpe(res.tipo_golpe) : null;
  const passo = res.proximo_passo || "Na dúvida, não pague e ligue para o número do verso do seu cartão.";
  const sinais = (res.sinais_encontrados || []).filter(Boolean).slice(0, 8);
  const fraseVoz = `${v.titulo} ${tipo ? `Parece ser o golpe: ${tipo}.` : ""} ${v.sub} O que fazer agora: ${passo}`;

  sessionStorage.setItem("gz.ultimo", JSON.stringify({ veredito: res.veredito, tipo, passo })); // sem o texto da mensagem

  const cartao = h("article", { class: `cartao resultado ${v.classe}`, tabindex: "-1" },
    h("div", { class: "resultado-topo" },
      medidor(v.risco, v.cor),
      h("div", {},
        h("h2", {}, v.classe === "golpe" ? "🚨 " : v.classe === "ok" ? "✅ " : "⚠️ ", v.titulo),
        tipo ? h("p", { class: "subtitulo" }, h("strong", {}, "Tipo: "), tipo) : null,
        h("p", { class: "subtitulo" }, v.sub))),
    h("div", { class: "resultado-corpo" },
      h("div", { class: "acao-agora" }, icone("alerta"),
        h("div", {}, h("span", { class: "rotulo" }, "O que fazer agora"), h("p", {}, passo))),
      sinais.length ? h("div", {}, h("h3", {}, "Por que achamos isso"), h("ul", { class: "sinais" }, sinais.map((x) => h("li", {}, x)))) : null,
      h("div", { class: "fonte-oficial" }, icone("escudo"), h("span", {}, "Fonte oficial: ", h("strong", {}, res.fonte_oficial || "—"))),
      h("div", { class: "acoes-resultado" },
        h("button", { type: "button", class: "botao botao-claro", onclick: () => falar(fraseVoz) || anunciar("Seu navegador não tem leitura em voz alta.") }, icone("alto_falante"), "Ouvir"),
        botaoAvisarFamilia({ veredito: res.veredito, tipo, passo }),
        h("button", { type: "button", class: "botao botao-claro", onclick: () => { pararFala(); aoNova(); } }, icone("voltar"), "Verificar outra")),
      h("p", { class: "aviso-ia" }, "O Golpe Zero usa inteligência artificial e pode errar. Ele ajuda, mas não garante 100%: quem decide é você. Na dúvida, confirme sempre pelo canal oficial.")));

  trocar(area, cartao);
  cartao.focus({ preventScroll: true });
  cartao.scrollIntoView({ behavior: "smooth", block: "start" });
  falar(fraseVoz);
}
