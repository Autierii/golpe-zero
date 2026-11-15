// Modo Família: avisar alguém de confiança pelo WhatsApp, sem cadastro.
// Nome/telefone do familiar ficam SÓ neste aparelho (localStorage); o servidor
// do Golpe Zero nunca recebe esses dados (LGPD: minimização).
import { h, trocar, anunciar } from "../dom.js";
import { icone } from "../icones.js";

const CHAVE = "gz.familia";
const SITE = location.origin;

export function lerFamiliar() {
  try { return JSON.parse(localStorage.getItem(CHAVE)) || { nome: "", telefone: "" }; }
  catch { return { nome: "", telefone: "" }; }
}
function salvarFamiliar(f) { localStorage.setItem(CHAVE, JSON.stringify(f)); }

function soDigitos(t) {
  let d = String(t || "").replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) d = "55" + d; // DDD + número -> padrão internacional
  return d.length >= 12 ? d : "";
}

export function mensagemAlerta({ veredito, tipo, passo }) {
  const fam = lerFamiliar();
  const oi = fam.nome ? `Oi, ${fam.nome}!` : "Oi!";
  const status = veredito === "golpe" ? "disse que É GOLPE" : veredito === "legitimo" ? "disse que parece seguro, mas quero confirmar" : "ficou na dúvida";
  return `${oi} 🛡️ Recebi uma mensagem estranha e o Golpe Zero ${status}` +
    `${tipo ? ` (${tipo})` : ""}.\n\nOrientação: ${passo}\n\nPode me ligar quando puder para a gente conferir junto?\n${SITE}`;
}

export function linkWhats(texto) {
  const tel = soDigitos(lerFamiliar().telefone);
  return `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`;
}

/** Botão usado no resultado da análise. */
export function botaoAvisarFamilia(dados) {
  const fam = lerFamiliar();
  const texto = mensagemAlerta(dados);
  const rotulo = fam.nome ? `Avisar ${fam.nome}` : "Avisar a família";
  return h("a", {
    class: "botao botao-whats", href: linkWhats(texto), target: "_blank", rel: "noopener noreferrer",
    onclick: async (e) => {
      if (navigator.share && !fam.telefone) {
        e.preventDefault();
        try { await navigator.share({ title: "Golpe Zero", text: texto }); } catch { /* cancelado */ }
      }
    },
  }, icone("whatsapp"), rotulo);
}

export function telaFamilia(raiz) {
  const fam = lerFamiliar();
  const nome = h("input", { type: "text", id: "fam-nome", value: fam.nome, autocomplete: "off", placeholder: "Ex.: Ana (minha filha)" });
  const tel = h("input", { type: "text", id: "fam-tel", value: fam.telefone, inputmode: "tel", autocomplete: "off", placeholder: "Ex.: (11) 98765-4321 — opcional" });
  const balao = h("div", { class: "whats-balao" });
  const ultimo = JSON.parse(sessionStorage.getItem("gz.ultimo") || "null");
  const exemplo = ultimo || { veredito: "golpe", tipo: "Falsa central do banco", passo: "Desligue e ligue para o número do verso do cartão. Não passe nenhum código." };

  const atualizar = () => { balao.textContent = mensagemAlerta(exemplo); };
  const salvar = () => {
    salvarFamiliar({ nome: nome.value.trim().slice(0, 40), telefone: tel.value.trim().slice(0, 20) });
    atualizar();
    anunciar("Contato salvo neste aparelho.");
  };
  nome.addEventListener("input", salvar);
  tel.addEventListener("input", salvar);
  atualizar();

  const pedirAjuda = h("a", {
    class: "botao botao-whats botao-largo botao-gigante", target: "_blank", rel: "noopener noreferrer", href: "#",
    onclick: (e) => { e.currentTarget.href = linkWhats(mensagemAlerta(exemplo)); },
  }, icone("whatsapp"), "Mandar este aviso agora");

  trocar(raiz,
    h("section", { class: "hero" },
      h("div", {},
        h("span", { class: "rotulo-secao" }, icone("familia", { width: 16, height: 16 }), "Modo Família"),
        h("h1", {}, "Ninguém precisa decidir sozinho"),
        h("p", {}, "Quando o Golpe Zero achar um golpe, você avisa um filho, neto ou amigo de confiança com um toque, pelo WhatsApp. Sem cadastro e sem senha."))),
    h("div", { class: "grade-2" },
      h("div", { class: "pilha" },
        h("div", { class: "cartao cartao-destaque pilha" },
          h("h2", {}, "1. Quem você quer avisar?"),
          h("div", {}, h("label", { class: "campo", for: "fam-nome" }, "Nome da pessoa"), nome),
          h("div", {}, h("label", { class: "campo", for: "fam-tel" }, "WhatsApp da pessoa"), tel,
            h("p", { class: "nota", style: "margin-top:.4rem" }, "Sem número, o WhatsApp abre para você escolher o contato.")),
          h("div", { class: "lembrete" }, icone("cadeado"),
            h("span", {}, h("strong", {}, "Fica só no seu celular. "), "Esses dados não vão para o Golpe Zero. Para apagar, limpe os campos.")),
          h("button", { type: "button", class: "botao botao-claro", onclick: () => { nome.value = ""; tel.value = ""; salvar(); } }, icone("x"), "Apagar contato")),
        h("div", { class: "cartao pilha" },
          h("h2", {}, "2. Como funciona"),
          h("ol", { class: "passo-a-passo" },
            h("li", {}, h("div", {}, h("strong", {}, "Você verifica a mensagem"), h("br"), h("span", { class: "nota" }, "Cola o texto ou manda o print na tela Verificar."))),
            h("li", {}, h("div", {}, h("strong", {}, "Toca em “Avisar”"), h("br"), h("span", { class: "nota" }, "O WhatsApp abre com o aviso pronto, sem a mensagem original."))),
            h("li", {}, h("div", {}, h("strong", {}, "A família confere com você"), h("br"), h("span", { class: "nota" }, "Juntos, vocês confirmam pelo canal oficial antes de agir.")))))),
      h("aside", { class: "pilha" },
        h("div", { class: "cartao pilha" },
          h("h2", { style: "font-size:1.2rem" }, "Prévia do aviso"),
          h("div", { class: "whats-previa" }, balao),
          pedirAjuda),
        h("a", { class: "botao botao-principal botao-largo", href: "#/" }, icone("escudo"), "Verificar uma mensagem"))));
}
