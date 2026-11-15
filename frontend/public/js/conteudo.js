// Conteúdo editorial do Golpe Zero (linguagem simples, baseado em Febraban,
// Banco Central, CERT.br e Procon-SP). Mensagens de exemplo são FICTÍCIAS.

export const EXEMPLOS = [
  { rotulo: "👨‍👩‍👧 Filho com número novo", texto: "Oi mãe, troquei de número, salva esse. Preciso pagar uma conta urgente hoje, consegue me fazer um Pix de R$ 1.450? Amanhã te devolvo." },
  { rotulo: "🏦 Central do banco", texto: "Aqui é da central de segurança do seu banco. Identificamos uma compra suspeita de R$ 2.300. Para cancelar, informe o código que chegou por SMS." },
  { rotulo: "📦 Entrega retida", texto: "Correios: sua encomenda está retida. Pague a taxa de R$ 9,90 para liberar a entrega em até 24h: http://bit.ly/libera-encomenda" },
  { rotulo: "🍰 Receita de bolo", texto: "Receita de bolo de fubá: 3 ovos, 2 xícaras de fubá, 1 de açúcar e 1 de leite. Forno a 180 graus por 40 minutos." },
];

const NOMES = {
  falso_whatsapp: "Falso parente / WhatsApp clonado",
  falsa_central: "Falsa central do banco",
  falsa_central_atendimento: "Falsa central do banco",
  falso_motoboy: "Falso motoboy (busca de cartão)",
  phishing: "Link falso (phishing)",
  falso_boleto: "Boleto falso",
  falso_emprestimo: "Falso empréstimo",
  falso_advogado: "Falso advogado",
  pix_errado_comprovante_falso: "Pix errado / comprovante falso",
  maquininha_quebrada_presente: "Maquininha quebrada / falso presente",
  med_pix: "Golpe com Pix",
  engenharia_social: "Engenharia social (manipulação)",
  preco_muito_baixo: "Oferta boa demais",
};

export function nomeDoGolpe(tipo) {
  if (!tipo) return null;
  const chave = String(tipo).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (NOMES[chave]) return NOMES[chave];
  const t = chave.replace(/_/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export const GOLPES = [
  { emoji: "👨‍👩‍👧", nome: "Falso parente (WhatsApp)", exemplo: "“Oi mãe, troquei de número. Preciso de um Pix urgente…”",
    sinal: "Número desconhecido, foto de um familiar e pedido de dinheiro com pressa.",
    acao: "Ligue para o número ANTIGO da pessoa ou faça uma pergunta que só ela sabe. Não faça o Pix." },
  { emoji: "🏦", nome: "Falsa central do banco", exemplo: "“Aqui é do seu banco, houve uma compra suspeita. Informe o código…”",
    sinal: "Pedem senha, código do SMS, que você instale um aplicativo ou faça um Pix “de segurança”.",
    acao: "Desligue. Ligue você mesmo para o número do verso do cartão. Banco nunca pede senha nem código." },
  { emoji: "🛵", nome: "Falso motoboy", exemplo: "“Seu cartão foi clonado, um portador vai buscar ele na sua casa.”",
    sinal: "Alguém quer buscar seu cartão em casa, mesmo que “cortado”.",
    acao: "Nunca entregue cartão a ninguém. Banco não busca cartão na casa do cliente." },
  { emoji: "🔗", nome: "Link falso (phishing)", exemplo: "“Sua conta será bloqueada hoje. Atualize seus dados no link.”",
    sinal: "Link encurtado ou estranho, ameaça de bloqueio, erro de português.",
    acao: "Não clique. Abra o aplicativo oficial do banco ou digite o endereço do site você mesmo." },
  { emoji: "🧾", nome: "Boleto falso", exemplo: "“Segue a segunda via com desconto, vence hoje.”",
    sinal: "Boleto que chega sem você pedir; o nome do beneficiário não é da empresa.",
    acao: "Antes de pagar, confira no app do banco o nome de quem vai receber." },
  { emoji: "💰", nome: "Falso empréstimo", exemplo: "“Crédito aprovado sem consulta! Só pague a taxa de liberação.”",
    sinal: "Pedem pagamento ANTES de liberar o dinheiro.",
    acao: "Empréstimo de verdade não cobra taxa antecipada. Não pague nada." },
  { emoji: "⚖️", nome: "Falso advogado", exemplo: "“Seu processo foi ganho, pague as custas para receber.”",
    sinal: "Usam seu nome e o número do processo, mas pedem Pix para liberar o valor.",
    acao: "Ligue para o seu advogado no número que você já tinha. Confira no site do tribunal." },
  { emoji: "📟", nome: "Maquininha quebrada", exemplo: "Entregador diz que o visor está quebrado e você não vê o valor.",
    sinal: "Visor escondido ou danificado, pressa para você digitar a senha.",
    acao: "Só digite a senha vendo o valor. Confira o valor antes de confirmar." },
];

export const CAI_NO_GOLPE = [
  "Ligue AGORA para o seu banco pelo número do verso do cartão ou pelo aplicativo e conte o que aconteceu.",
  "Se foi Pix, peça ao banco para abrir o MED (Mecanismo Especial de Devolução) do Banco Central. Quanto antes, maior a chance de recuperar.",
  "Troque suas senhas e bloqueie o cartão, se você passou dados dele.",
  "Registre um boletim de ocorrência. Em SP dá para fazer pela internet, na Delegacia Eletrônica da Polícia Civil.",
  "Avise sua família e conte o que aconteceu: golpe não é vergonha, e falar ajuda a proteger outras pessoas.",
];

// Mensagens FICTÍCIAS para treino.
export const QUIZ = [
  { remetente: "+55 11 9xxxx-1234", msg: "Pai, meu celular quebrou, esse é meu número novo. Me faz um Pix de R$ 800? É urgente.", golpe: true,
    porque: "Número novo + pedido de dinheiro com pressa = golpe do falso parente. Ligue no número antigo." },
  { remetente: "Banco (SMS)", msg: "Compra aprovada: R$ 54,90 em PADARIA SAO JOSE. Se não reconhece, ligue para o número no verso do seu cartão.", golpe: false,
    porque: "É só um aviso: não tem link, não pede código e manda ligar no número do SEU cartão." },
  { remetente: "Central de Segurança", msg: "Detectamos acesso suspeito. Para proteger sua conta, transfira o saldo para a conta segura informada.", golpe: true,
    porque: "Não existe “conta segura”. Banco nunca pede para você transferir dinheiro para se proteger." },
  { remetente: "Farmácia (WhatsApp oficial)", msg: "Seu pedido nº 4521 saiu para entrega e chega hoje até as 18h.", golpe: false,
    porque: "Informa um pedido que você fez e não pede pagamento, senha nem clique em link." },
  { remetente: "INSS", msg: "Seu benefício será suspenso. Regularize em 24h no link: inss-beneficio-regulariza.com", golpe: true,
    porque: "Ameaça + prazo curto + link estranho. O INSS usa o app e o site oficial Meu INSS." },
  { remetente: "Entregador na porta", msg: "A maquininha está com o visor quebrado, pode digitar a senha que eu confirmo o valor.", golpe: true,
    porque: "Nunca digite a senha sem ver o valor na tela." },
  { remetente: "Filha (número que você já tem salvo)", msg: "Mãe, chego aí às 19h pro jantar, quer que eu leve pão?", golpe: false,
    porque: "Número conhecido, nenhum pedido de dinheiro ou dado. Mensagem normal do dia a dia." },
  { remetente: "Loja Oficial", msg: "Celular de R$ 5.000 por R$ 499 só hoje! Pague no Pix para garantir.", golpe: true,
    porque: "Preço bom demais + pressa + Pix antecipado = golpe da oferta falsa." },
];

// Números com fonte (painel). Valores conferidos nas fontes citadas.
export const DADOS = {
  brasil: {
    estelionatos2025: 2261055,
    crescimentoDesde2018: 429.8,
    vitimas2025: 26300000,
    percentualPopulacao: 15.8,
    porHora: 258,
    fonte: "20º Anuário Brasileiro de Segurança Pública (FBSP, 2026)",
  },
  sp: {
    populacao: 44411238,
    idosos: 7650568,
    capitalPopulacao: 11451999,
    capitalIdosos: 2023060,
    faixas: [
      ["60–64", 2365382], ["65–69", 1900681], ["70–74", 1403952], ["75–79", 913197],
      ["80–84", 577843], ["85–89", 313739], ["90–94", 135807], ["95–99", 34872], ["100+", 5095],
    ],
    fonte: "IBGE, Censo 2022 (SIDRA, tabela 9514)",
  },
  base: [
    ["Pix e devolução (MED)", 19], ["Prevenção a fraudes", 18], ["Manipulação (engenharia social)", 15],
    ["Link falso (phishing)", 13], ["Falso parente (WhatsApp)", 10], ["O que fazer se cair", 8],
    ["Pix errado / comprovante falso", 6], ["Maquininha quebrada", 6], ["Falso advogado", 6],
    ["Falso empréstimo", 5], ["Boleto falso", 5], ["Falsa central", 4],
  ],
};
