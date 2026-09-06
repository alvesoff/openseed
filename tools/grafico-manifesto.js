// Dados e traçado do gráfico do manifesto.
//
// Por que existe: o gráfico precisa aparecer sem JavaScript, então o traçado
// vive no atributo `d` dentro do HTML. Mas um bezier de 24 pontos de controle
// não se edita à mão, e sem os números originais por perto ninguém consegue
// atualizar o gráfico quando o estudo publicar dados novos. Este arquivo é a
// fonte da verdade: os números, a escala e o algoritmo moram aqui, e o HTML
// recebe o resultado.
//
//   node tools/grafico-manifesto.js             escreve o traçado no HTML
//   node tools/grafico-manifesto.js --conferir  só compara, e sai com erro
//
// Mexeu nos dados? Rode sem --conferir e atualize a nota de fonte da página.

const fs = require("fs"), path = require("path");
const PAGINA = path.join(__dirname, "..", "docs", "manifesto.html");
const conferir = process.argv.indexOf("--conferir") > -1;

/* ---------------------------------------------------------------- OS DADOS

   Participação da IA no conteúdo publicado, em porcentagem.
   Só quatro valores vêm do estudo da Graphite:

     até nov/2022   4,2%   piso de base, que é também a taxa de falso positivo
                           do detector usado no estudo
     nov/2023        39%   doze meses depois do lançamento do ChatGPT
     nov/2024        50%   a virada, quando ultrapassa o texto humano
     mai/2025        51%   estável desde então, fim da janela do estudo

   Os demais existem só para dar forma à curva, e a legenda da página diz
   isso. A linha humana é o complemento: 100 menos a da IA.

   Fonte: Graphite e Common Crawl, 43 mil URLs em inglês, jan/2020 a mai/2025.
   https://graphite.io/five-percent/more-articles-are-now-created-by-ai-than-humans
*/
const IA = [
  [2020, 4.2], [2021, 4.2], [2022, 4.2], [2022.85, 4.2],
  [2023.3, 20], [2023.85, 39],
  [2024.35, 45], [2024.85, 50], [2025.4, 51],
];
// Quais desses são medição, e não interpolação. Ganham um ponto marcado.
const MEDIDOS = [2022.85, 2023.85, 2024.85, 2025.4];

/* --------------------------------------------------------------- A ESCALA
   Casa com o viewBox "0 0 600 360" do SVG. O eixo x vai de 2020 a 2026 em
   passos de 90 unidades por ano; o y põe 0% na linha 320 e 100% na 30. */
const sx = ano => 60 + (ano - 2020) * 90;
const sy = valor => 320 - valor * 2.9;
const r2 = n => Math.round(n * 100) / 100;

/* Catmull-Rom convertido para bezier cúbico: passa por todos os pontos, sem
   os cotovelos de uma polilinha nem o exagero de uma spline solta. */
function suavizar(pontos) {
  let d = "M " + r2(pontos[0][0]) + " " + r2(pontos[0][1]);
  for (let i = 0; i < pontos.length - 1; i++) {
    const p0 = pontos[i - 1] || pontos[i];
    const p1 = pontos[i];
    const p2 = pontos[i + 1];
    const p3 = pontos[i + 2] || p2;
    d += " C " + r2(p1[0] + (p2[0] - p0[0]) / 6) + " " + r2(p1[1] + (p2[1] - p0[1]) / 6)
       + " " + r2(p2[0] - (p3[0] - p1[0]) / 6) + " " + r2(p2[1] - (p3[1] - p1[1]) / 6)
       + " " + r2(p2[0]) + " " + r2(p2[1]);
  }
  return d;
}

const emTela = serie => serie.map(p => [sx(p[0]), sy(p[1])]);
const HUMANO = IA.map(p => [p[0], 100 - p[1]]);

const traco = {
  humano: suavizar(emTela(HUMANO)),
  ia: suavizar(emTela(IA)),
};
const pontos = IA.filter(p => MEDIDOS.indexOf(p[0]) > -1)
  .map(p => '<circle cx="' + r2(sx(p[0])) + '" cy="' + r2(sy(p[1])) + '" r="4.5"/>');

/* ------------------------------------------------------------- A ESCRITA */
let html = fs.readFileSync(PAGINA, "utf8");
const crlf = html.indexOf("\r\n") > -1;
if (crlf) html = html.replace(/\r\n/g, "\n");
const original = html;

function trocarAtributo(id, novo) {
  const re = new RegExp('(id="' + id + '"[^>]*?\\sd=")[^"]*(")');
  if (!re.test(html)) { console.error("não achei o path #" + id + " com atributo d"); process.exit(1); }
  html = html.replace(re, "$1" + novo + "$2");
}
trocarAtributo("tracoHumano", traco.humano);
trocarAtributo("tracoIA", traco.ia);

const reGrupo = /(<g class="pontos-medidos"[^>]*>)([\s\S]*?)(<\/g>)/;
if (!reGrupo.test(html)) { console.error("não achei o grupo .pontos-medidos"); process.exit(1); }
html = html.replace(reGrupo, function (_, abre, __, fecha) {
  return abre + "\n            " + pontos.join("\n            ") + "\n          " + fecha;
});

if (html === original) {
  console.log("igual: o traçado no HTML já é o que estes dados geram");
  process.exit(0);
}
if (conferir) {
  console.error("DIFERE: o traçado de docs/manifesto.html não bate com os dados deste arquivo.");
  console.error("Rode sem --conferir para acertar.");
  process.exit(1);
}
if (crlf) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(PAGINA, html);
console.log("escrito: docs/manifesto.html (" + IA.length + " pontos, " + pontos.length + " medidos)");
