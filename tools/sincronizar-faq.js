// Mantém o FAQPage do JSON-LD igual ao FAQ visível da página.
//
// Por que existe: o Google exige que a resposta marcada como FAQPage esteja
// escrita na tela, palavra por palavra. Marcação que não bate com o texto
// visível conta como spam. Manter as duas cópias na mão sempre desanda.
//
//   node tools/sincronizar-faq.js            escreve o JSON-LD a partir da tela
//   node tools/sincronizar-faq.js --conferir só compara, e sai com erro se difere
//
// A fonte da verdade é sempre o texto visível dentro de <details>.

const fs = require("fs"), path = require("path");
const conferir = process.argv.indexOf("--conferir") > -1;
const paginas = [
  path.join(__dirname, "..", "docs", "index.html"),
  path.join(__dirname, "..", "docs", "en", "index.html"),
];

// Em dois passos, de propósito. A primeira versão casava a pergunta inteira
// numa expressão só, o que exigia data-assunto como único atributo e um <p>
// exatamente antes de </details>. Escrever <details open data-assunto="x"> ou
// dar duas frases de resposta fazia a pergunta sumir do JSON-LD sem avisar.
const DETALHE = /<details\b([^>]*)>([\s\S]*?)<\/details>/g;
const ASSUNTO = /data-assunto="([^"]+)"/;
const SUMARIO = /<summary>([\s\S]*?)<\/summary>/;
const PARAGRAFO = /<p\b[^>]*>([\s\S]*?)<\/p>/g;

function texto(html) {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

let falhou = false;

for (const arq of paginas) {
  let s = fs.readFileSync(arq, "utf8");
  const crlf = s.indexOf("\r\n") > -1;
  if (crlf) s = s.replace(/\r\n/g, "\n");

  const visiveis = [];
  let m;
  DETALHE.lastIndex = 0;
  while ((m = DETALHE.exec(s))) {
    const atributos = m[1], dentro = m[2];
    const assunto = (atributos.match(ASSUNTO) || [])[1];
    if (!assunto) {
      console.error("um <details> desta página não tem data-assunto: " + arq
        + "\n  " + dentro.trim().slice(0, 90).replace(/\s+/g, " ")
        + "\n  Sem o atributo ele fica de fora do JSON-LD e da ferramenta de IA.");
      process.exit(1);
    }
    const sumario = (dentro.match(SUMARIO) || [])[1];
    if (!sumario) { console.error("<details data-assunto=\"" + assunto + "\"> sem <summary> em " + arq); process.exit(1); }
    // Resposta com mais de um parágrafo vira um texto só, separado por espaço.
    const partes = [];
    let p; PARAGRAFO.lastIndex = 0;
    while ((p = PARAGRAFO.exec(dentro))) partes.push(texto(p[1]));
    if (!partes.length) { console.error("<details data-assunto=\"" + assunto + "\"> sem <p> de resposta em " + arq); process.exit(1); }
    visiveis.push({ assunto: assunto, pergunta: texto(sumario), resposta: partes.join(" ") });
  }
  if (!visiveis.length) { console.error("sem <details> em " + arq); process.exit(1); }

  const abre = s.indexOf('<script type="application/ld+json">');
  const fecha = s.indexOf("</script>", abre);
  if (abre < 0 || fecha < 0) { console.error("sem bloco JSON-LD em " + arq); process.exit(1); }
  const bruto = s.slice(abre + '<script type="application/ld+json">'.length, fecha);

  let dados;
  try { dados = JSON.parse(bruto); }
  catch (e) { console.error("JSON-LD inválido em " + arq + ": " + e.message); process.exit(1); }

  const grafo = dados["@graph"] || [dados];
  const faq = grafo.filter(function (n) { return n["@type"] === "FAQPage"; })[0];
  if (!faq) { console.error("sem nó FAQPage em " + arq); process.exit(1); }

  const novo = visiveis.map(function (v) {
    return {
      "@type": "Question",
      "name": v.pergunta,
      "acceptedAnswer": { "@type": "Answer", "text": v.resposta },
    };
  });

  const antes = JSON.stringify(faq.mainEntity);
  const depois = JSON.stringify(novo);
  const nome = path.relative(path.join(__dirname, ".."), arq).split(path.sep).join("/");

  if (antes === depois) { console.log("igual: " + nome + " (" + visiveis.length + " perguntas)"); continue; }

  if (conferir) {
    falhou = true;
    console.error("DIFERE: " + nome);
    const velhas = faq.mainEntity || [];
    for (let i = 0; i < Math.max(velhas.length, novo.length); i++) {
      const a = velhas[i], b = novo[i];
      if (!a) { console.error("  falta no JSON-LD: " + b.name); continue; }
      if (!b) { console.error("  sobra no JSON-LD: " + a.name); continue; }
      if (a.name !== b.name) console.error("  pergunta " + (i + 1) + "\n    tela:    " + b.name + "\n    JSON-LD: " + a.name);
      const ra = a.acceptedAnswer && a.acceptedAnswer.text;
      if (ra !== b.acceptedAnswer.text) console.error("  resposta " + (i + 1) + "\n    tela:    " + b.acceptedAnswer.text + "\n    JSON-LD: " + ra);
    }
    continue;
  }

  faq.mainEntity = novo;
  let saida = JSON.stringify(dados, null, 2);
  s = s.slice(0, abre) + '<script type="application/ld+json">\n' + saida + "\n" + s.slice(fecha);
  if (crlf) s = s.replace(/\n/g, "\r\n");
  fs.writeFileSync(arq, s);
  console.log("escrito: " + nome + " (" + visiveis.length + " perguntas)");
}

if (falhou) {
  console.error("\nO FAQ visível e o JSON-LD não batem. Rode sem --conferir para acertar.");
  process.exit(1);
}
