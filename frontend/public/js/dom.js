// Utilitários de DOM sem innerHTML: todo texto vindo da API entra como texto,
// nunca como HTML (proteção contra XSS mesmo se a LLM devolver algo estranho).

const SVG_NS = "http://www.w3.org/2000/svg";

/** Cria um elemento: h("div", {class: "x", onclick: fn}, "texto", outroEl) */
export function h(tag, attrs = {}, ...filhos) {
  const el = document.createElement(tag);
  aplicar(el, attrs);
  anexar(el, filhos);
  return el;
}

/** Mesmo que h(), para elementos SVG (gráficos e medidor). */
export function s(tag, attrs = {}, ...filhos) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    el.setAttribute(k, String(v));
  }
  anexar(el, filhos);
  return el;
}

function aplicar(el, attrs) {
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (k === "class") el.className = v;
    // via CSSOM: a CSP (style-src 'self') bloqueia o atributo style, mas não isto
    else if (k === "style") el.style.cssText = v;
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (v === true) el.setAttribute(k, "");
    else el.setAttribute(k, String(v));
  }
}

function anexar(el, filhos) {
  for (const f of filhos.flat(Infinity)) {
    if (f === null || f === undefined || f === false) continue;
    el.append(f instanceof Node ? f : document.createTextNode(String(f)));
  }
}

/** Troca todo o conteúdo de um elemento. */
export function trocar(el, ...filhos) {
  el.replaceChildren();
  anexar(el, filhos);
  return el;
}

/** Número no formato brasileiro. */
export const num = (n, casas = 0) =>
  Number(n).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

/** Leitura em voz alta (pt-BR), se o navegador suportar. */
export function falar(frase) {
  if (!("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(frase);
  fala.lang = "pt-BR";
  fala.rate = 0.92;
  const voz = window.speechSynthesis.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith("pt-br"));
  if (voz) fala.voice = voz;
  window.speechSynthesis.speak(fala);
  return true;
}

export function pararFala() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

/** Anuncia algo para leitores de tela. */
export function anunciar(texto) {
  let r = document.getElementById("anuncio");
  if (!r) {
    r = h("div", { id: "anuncio", class: "sr-only", "aria-live": "polite" });
    document.body.append(r);
  }
  r.textContent = "";
  setTimeout(() => { r.textContent = texto; }, 50);
}
