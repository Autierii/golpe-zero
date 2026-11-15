// Aprender: golpes mais comuns, "caí no golpe, e agora?" e quiz "É golpe ou não?".
import { h, trocar, falar, anunciar } from "../dom.js";
import { icone } from "../icones.js";
import { GOLPES, CAI_NO_GOLPE, QUIZ } from "../conteudo.js";

export function telaAprender(raiz) {
  const quiz = h("section", { class: "cartao cartao-destaque", id: "quiz", "aria-live": "polite" });

  trocar(raiz,
    h("section", { class: "hero" },
      h("div", {},
        h("span", { class: "rotulo-secao" }, icone("livro", { width: 16, height: 16 }), "Aprender"),
        h("h1", {}, "Conheça os golpes antes que eles conheçam você"),
        h("p", {}, "Os golpes mudam de roupa, mas o truque é quase sempre o mesmo: pressa, medo ou uma oferta boa demais."))),

    quiz,

    h("h2", { style: "margin-top:2rem" }, "Os golpes mais comuns"),
    h("div", { class: "grade-3" }, GOLPES.map(cartaoGolpe)),

    h("details", { class: "cartao", id: "caiu", style: "margin-top:2rem", open: location.hash.includes("caiu") },
      h("summary", {}, h("span", {}, "🆘 Caí em um golpe. E agora?")),
      h("ol", { class: "passo-a-passo" }, CAI_NO_GOLPE.map((t) => h("li", {}, h("div", {}, t)))),
      h("p", { class: "nota", style: "margin-top:1rem" }, "Fontes: Banco Central do Brasil (MED), Febraban Antifraudes, Polícia Civil de SP.")));

  iniciarQuiz(quiz);
  if (location.hash.includes("caiu")) setTimeout(() => document.getElementById("caiu").scrollIntoView({ behavior: "smooth" }), 100);
}

function cartaoGolpe(g) {
  const fala = `${g.nome}. Exemplo: ${g.exemplo}. Sinal de alerta: ${g.sinal}. O que fazer: ${g.acao}`;
  return h("article", { class: "cartao golpe-card" },
    h("div", { class: "cabeca" }, h("span", { class: "emoji", "aria-hidden": "true" }, g.emoji), h("h3", { style: "margin:0" }, g.nome)),
    h("p", { class: "exemplo" }, g.exemplo),
    h("dl", {},
      h("dt", {}, "Sinal de alerta"), h("dd", {}, g.sinal),
      h("dt", {}, "O que fazer"), h("dd", {}, h("strong", {}, g.acao))),
    h("button", { type: "button", class: "chip", style: "align-self:flex-start;margin-top:auto", onclick: () => falar(fala) }, icone("alto_falante", { width: 18, height: 18 }), "Ouvir"));
}

function iniciarQuiz(alvo) {
  let i = 0, acertos = 0;

  function pergunta() {
    const q = QUIZ[i];
    const feedback = h("div", { hidden: true });
    const botoes = h("div", { class: "quiz-botoes" },
      h("button", { type: "button", class: "botao botao-golpe", onclick: () => responder(true) }, icone("alerta"), "É golpe"),
      h("button", { type: "button", class: "botao botao-seguro", onclick: () => responder(false) }, icone("check"), "É seguro"));

    function responder(disseGolpe) {
      const certo = disseGolpe === q.golpe;
      if (certo) acertos++;
      botoes.querySelectorAll("button").forEach((b) => { b.disabled = true; });
      trocar(feedback,
        h("div", { class: `quiz-feedback ${certo ? "certo" : "errado"}` },
          h("strong", {}, certo ? "✅ Acertou! " : "❌ Quase! ", q.golpe ? "Era golpe." : "Era seguro."),
          h("p", { style: "margin:.4rem 0 0" }, q.porque)),
        h("button", { type: "button", class: "botao botao-principal", style: "margin-top:1rem", onclick: () => { i++; i < QUIZ.length ? pergunta() : fim(); } },
          i + 1 < QUIZ.length ? "Próxima mensagem →" : "Ver resultado"));
      feedback.hidden = false;
      anunciar(`${certo ? "Acertou" : "Errou"}. ${q.porque}`);
      feedback.querySelector(".botao").focus();
    }

    trocar(alvo,
      h("div", { style: "display:flex;justify-content:space-between;align-items:baseline;gap:1rem;flex-wrap:wrap" },
        h("h2", { style: "margin:0" }, "🎯 É golpe ou não?"),
        h("span", { class: "nota" }, `Mensagem ${i + 1} de ${QUIZ.length} · ${acertos} acertos`)),
      h("div", { class: "progresso", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": QUIZ.length, "aria-valuenow": i }, h("span", { style: `width:${(100 * i) / QUIZ.length}%` })),
      h("div", { class: "quiz-msg" }, h("span", { class: "remetente" }, q.remetente), q.msg),
      botoes, feedback);
  }

  function fim() {
    const nota = acertos / QUIZ.length;
    trocar(alvo,
      h("h2", {}, nota === 1 ? "🏆 Perfeito!" : nota >= 0.75 ? "👏 Muito bem!" : "💪 Bom treino!"),
      h("p", { style: "font-size:1.2rem" }, `Você acertou ${acertos} de ${QUIZ.length}.`),
      h("p", { class: "nota" }, "Lembre: na dúvida, verifique no Golpe Zero e confirme pelo canal oficial."),
      h("div", { style: "display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem" },
        h("button", { type: "button", class: "botao botao-claro", onclick: () => { i = 0; acertos = 0; pergunta(); } }, icone("voltar"), "Jogar de novo"),
        h("a", { class: "botao botao-principal", href: "#/" }, icone("escudo"), "Verificar uma mensagem")));
  }

  pergunta();
}
