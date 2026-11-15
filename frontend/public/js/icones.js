// Ícones de traço (estilo Lucide, desenhados à mão) montados como SVG via DOM.
import { s } from "./dom.js";

const P = {
  escudo: ["M12 3 4 6v6c0 5 3.4 8.6 8 9.9 4.6-1.3 8-4.9 8-9.9V6l-8-3Z", "m9 12 2 2 4-4"],
  livro: ["M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z", "M4 19a2 2 0 0 1 2-2h13", "M9 7h6"],
  grafico: ["M4 20V10", "M10 20V4", "M16 20v-7", "M22 20H2"],
  familia: ["M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z", "M2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5", "M17 11a3 3 0 1 0-.9-5.9", "M18.5 14.6c1.7.7 2.8 2.5 3 5.4"],
  texto: ["M4 6h16", "M4 11h16", "M4 16h10"],
  camera: ["M4 8h3l2-3h6l2 3h3v11H4V8Z", "M12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"],
  enviar: ["m4 12 16-8-6 16-2.5-6.5L4 12Z", "m11.5 13.5 3-3"],
  alto_falante: ["M4 10v4h4l5 4V6L8 10H4Z", "M16.5 9a4 4 0 0 1 0 6", "M19 6.5a7.5 7.5 0 0 1 0 11"],
  voltar: ["M9 14 4 9l5-5", "M4 9h11a5 5 0 0 1 0 10h-3"],
  whatsapp: ["M3.5 20.5 5 16a8.5 8.5 0 1 1 3.2 3.2L3.5 20.5Z", "M9 9.5c.3 2.6 2.6 4.9 5.5 5.5l1.2-1.4-1.9-1-1 .9c-1-.4-1.9-1.3-2.3-2.3l.9-1-1-1.9L9 9.5Z"],
  alerta: ["M12 3 2 20h20L12 3Z", "M12 10v4", "M12 17h.01"],
  check: ["M5 12.5 10 17l9-10"],
  x: ["M6 6l12 12", "M18 6 6 18"],
  link: ["M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1", "M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"],
  telefone: ["M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z"],
  cadeado: ["M6 11h12v10H6V11Z", "M8.5 11V8a3.5 3.5 0 0 1 7 0v3"],
  relogio: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7v5l3 2"],
  lupa: ["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z", "m20 20-4-4"],
  maos: ["M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z"],
  imagem: ["M4 5h16v14H4V5Z", "m4 16 5-5 4 4 2-2 5 5", "M15.5 9.5h.01"],
  info: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 11v5", "M12 8h.01"],
  dinheiro: ["M3 7h18v10H3V7Z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M6 10v.01M18 14v.01"],
};

export function icone(nome, attrs = {}) {
  const paths = P[nome] || P.info;
  return s(
    "svg",
    { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false", ...attrs },
    paths.map((d) => s("path", { d })),
  );
}
