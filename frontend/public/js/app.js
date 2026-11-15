// Golpe Zero — SPA sem framework (roteamento por hash, módulos ES nativos).
import { h, trocar, pararFala } from "./dom.js";
import { icone } from "./icones.js";
import { telaVerificar } from "./telas/verificar.js";
import { telaAprender } from "./telas/aprender.js";
import { telaPainel } from "./telas/painel.js";
import { telaFamilia } from "./telas/familia.js";

const ROTAS = [
  { caminho: "/", nome: "Verificar", icone: "escudo", tela: telaVerificar, titulo: "É golpe? Descubra antes de agir" },
  { caminho: "/aprender", nome: "Aprender", icone: "livro", tela: telaAprender, titulo: "Aprenda a reconhecer golpes" },
  { caminho: "/familia", nome: "Família", icone: "familia", tela: telaFamilia, titulo: "Modo Família" },
  { caminho: "/painel", nome: "Números", icone: "grafico", tela: telaPainel, titulo: "Golpes em números" },
];

const main = document.getElementById("conteudo");

function montarNavegacao() {
  const links = (classe) =>
    ROTAS.map((r) => h("a", { href: `#${r.caminho}`, "data-rota": r.caminho, class: classe }, icone(r.icone), h("span", {}, r.nome)));
  trocar(document.getElementById("nav-topo"), links());
  trocar(document.getElementById("nav-baixo"), links());
}

function rotaAtual() {
  const caminho = (location.hash.replace(/^#/, "") || "/").split("?")[0];
  return ROTAS.find((r) => r.caminho === caminho) || ROTAS[0];
}

function navegar() {
  pararFala();
  const rota = rotaAtual();
  document.title = `${rota.titulo} · Golpe Zero`;
  document.querySelectorAll("[data-rota]").forEach((a) => {
    if (a.dataset.rota === rota.caminho) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  const view = h("div", { class: "view" });
  trocar(main, view);
  rota.tela(view);
  window.scrollTo({ top: 0 });
  if (document.activeElement && document.activeElement !== document.body) main.focus({ preventScroll: true });
}

// ---------- acessibilidade: tamanho da letra e alto contraste (só no aparelho) ----------
const raiz = document.documentElement;
const pref = { escala: Number(localStorage.getItem("gz.escala") || 1), contraste: localStorage.getItem("gz.contraste") === "1" };
function aplicarPreferencias() {
  raiz.style.setProperty("--escala", String(pref.escala));
  raiz.classList.toggle("contraste", pref.contraste);
  document.getElementById("contraste").setAttribute("aria-pressed", String(pref.contraste));
  localStorage.setItem("gz.escala", String(pref.escala));
  localStorage.setItem("gz.contraste", pref.contraste ? "1" : "0");
}
document.getElementById("fonte-mais").addEventListener("click", () => { pref.escala = Math.min(1.45, +(pref.escala + 0.1).toFixed(2)); aplicarPreferencias(); });
document.getElementById("fonte-menos").addEventListener("click", () => { pref.escala = Math.max(0.85, +(pref.escala - 0.1).toFixed(2)); aplicarPreferencias(); });
document.getElementById("contraste").addEventListener("click", () => { pref.contraste = !pref.contraste; aplicarPreferencias(); });

montarNavegacao();
aplicarPreferencias();
window.addEventListener("hashchange", navegar);
navegar();
