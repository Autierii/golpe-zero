// Golpe Zero — frontend sem framework, sem rastreadores e sem dependências externas.
"use strict";

const $ = (id) => document.getElementById(id);
const form = $("form"), texto = $("texto"), foto = $("foto"), enviar = $("enviar");
const carregando = $("carregando"), resultado = $("resultado");

const VEREDITOS = {
  golpe: { titulo: "🚨 É GOLPE! Não faça nada do que a mensagem pede.", classe: "v-golpe" },
  suspeito: { titulo: "⚠️ Cuidado: parece suspeito.", classe: "v-duvida" },
  legitimo: { titulo: "✅ Parece seguro, mas confirme pelo canal oficial.", classe: "v-ok" },
  nao_consta: { titulo: "❔ Não encontramos esse caso nas fontes oficiais. Na dúvida, não pague e confirme com o banco.", classe: "v-duvida" },
};

// Reduz a foto no próprio celular antes de enviar (internet fraca / plano de dados)
async function comprimirImagem(arquivo, ladoMax = 1280, qualidade = 0.7) {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, ladoMax / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((ok) => canvas.toBlob(ok, "image/jpeg", qualidade));
}

async function chamarApi() {
  const msg = texto.value.trim();
  const arquivo = foto.files[0];
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), 150000);
  try {
    let resp;
    if (arquivo) {
      const dados = new FormData();
      dados.append("foto", await comprimirImagem(arquivo), "print.jpg");
      dados.append("texto_adicional", msg);
      resp = await fetch("/api/analisar/imagem", { method: "POST", body: dados, signal: controle.signal });
    } else {
      resp = await fetch("/api/analisar/texto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: msg, arquitetura: "agente" }),
        signal: controle.signal,
      });
    }
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    return await resp.json();
  } finally {
    clearTimeout(limite);
  }
}

function falar(frase) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(frase);
  fala.lang = "pt-BR";
  fala.rate = 0.9;
  window.speechSynthesis.speak(fala);
}

let fraseFalada = "";

function mostrar(res) {
  const v = VEREDITOS[res.veredito] || VEREDITOS.nao_consta;
  const el = $("veredito");
  el.textContent = v.titulo;
  el.className = "veredito " + v.classe;
  $("proximo-passo").textContent = res.proximo_passo || "Na dúvida, não pague e ligue para o número do verso do cartão.";
  const lista = $("sinais");
  lista.replaceChildren(...(res.sinais_encontrados || []).map((s) => {
    const li = document.createElement("li"); li.textContent = s; return li;
  }));
  $("fonte").textContent = res.fonte_oficial || "—";
  carregando.classList.add("escondido");
  resultado.classList.remove("escondido");
  resultado.focus();
  fraseFalada = `${v.titulo} ${$("proximo-passo").textContent}`;
  falar(fraseFalada);
}

function mostrarErro() {
  mostrar({
    veredito: "nao_consta",
    proximo_passo: "Não conseguimos analisar agora. Enquanto isso, NÃO pague, NÃO clique em links e ligue você mesmo para o número do verso do seu cartão.",
    sinais_encontrados: ["O serviço está instável no momento. Tente de novo em alguns minutos."],
    fonte_oficial: "Febraban — orientação geral",
  });
}

foto.addEventListener("change", () => {
  $("foto-nome").textContent = foto.files[0] ? "✔ Foto escolhida. Agora toque em Verificar." : "";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!texto.value.trim() && !foto.files[0]) {
    texto.focus();
    $("foto-nome").textContent = "Escreva a mensagem ou escolha uma foto primeiro.";
    return;
  }
  enviar.disabled = true;
  resultado.classList.add("escondido");
  carregando.classList.remove("escondido");
  try { mostrar(await chamarApi()); } catch { mostrarErro(); } finally { enviar.disabled = false; }
});

$("ouvir").addEventListener("click", () => falar(fraseFalada));
$("nova").addEventListener("click", () => {
  form.reset(); $("foto-nome").textContent = "";
  resultado.classList.add("escondido"); texto.focus();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
});
