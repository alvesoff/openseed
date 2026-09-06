// Confere as regras do site que não dá para lembrar de cabeça.
// Uso: node tools/conferir.js     (sai com 1 se algo estiver errado)
//
// Cada checagem existe porque o erro correspondente já aconteceu ou foi
// apontado em revisão. Se acrescentar regra, acrescente também o motivo.

const fs = require("fs"), path = require("path"), cp = require("child_process");

const RAIZ = path.join(__dirname, "..");
const DOCS = path.join(RAIZ, "docs");
const DOMINIO = "https://openseed.com.br";
const NUMERO = "5516997052711";

const problemas = [];
const avisos = [];
function erro(area, msg) { problemas.push("[" + area + "] " + msg); }
function aviso(area, msg) { avisos.push("[" + area + "] " + msg); }

function arquivos(dir, acc) {
  acc = acc || [];
  for (const nome of fs.readdirSync(dir)) {
    const p = path.join(dir, nome);
    if (fs.statSync(p).isDirectory()) arquivos(p, acc);
    else acc.push(p);
  }
  return acc;
}
const rel = p => path.relative(RAIZ, p).split(path.sep).join("/");
const url = p => "/" + path.relative(DOCS, p).split(path.sep).join("/");

const todos = arquivos(DOCS);
const paginas = todos.filter(p => p.endsWith(".html"));
const conteudo = new Map(paginas.map(p => [p, fs.readFileSync(p, "utf8")]));
/* Sem os comentários. As tags <img> dos cards de projeto nascem comentadas de
   propósito, e sem isto o conferidor cobrava um arquivo que ainda não existe. */
const semComentario = new Map([...conteudo].map(([p, s]) => [p, s.replace(/<!--[\s\S]*?-->/g, "")]));

/* 1. FAQ visível contra FAQPage do JSON-LD.
   Marcação de FAQ sem o texto na tela conta como spam para o Google. */
const faq = cp.spawnSync(process.execPath, [path.join(__dirname, "sincronizar-faq.js"), "--conferir"], { encoding: "utf8" });
if (faq.status !== 0) {
  erro("faq", "o FAQ visível e o JSON-LD divergem. Rode: node tools/sincronizar-faq.js\n"
    + (faq.stderr || "").trim().split("\n").map(l => "        " + l).join("\n"));
}

/* 1b. O traçado do gráfico do manifesto contra os dados que o geram.
   O d é um bezier de 24 pontos de controle: ninguém confere isso a olho, e
   editar o HTML sem passar pela ferramenta desliga silenciosamente a única
   ligação entre o desenho e os números do estudo. */
const grafico = cp.spawnSync(process.execPath, [path.join(__dirname, "grafico-manifesto.js"), "--conferir"], { encoding: "utf8" });
if (grafico.status !== 0) {
  erro("grafico", "o traçado de docs/manifesto.html não bate com os dados de tools/grafico-manifesto.js.\n"
    + "        Rode: node tools/grafico-manifesto.js");
}

/* 2. Um número de WhatsApp só, em todo lugar.
   Ele está espalhado por seis arquivos e trocar num só já aconteceu. */
const TEL = /(?:\+?55[\s.-]?)?\(?16\)?[\s.-]?9[\s.-]?\d{4}[\s.-]?\d{4}/g;
for (const p of todos) {
  if (/\.(png|svg|ico|woff2?)$/.test(p)) continue;
  const s = fs.readFileSync(p, "utf8");
  let m; TEL.lastIndex = 0;
  while ((m = TEL.exec(s))) {
    let d = m[0].replace(/\D/g, "");
    if (d.length === 11) d = "55" + d;
    if (d !== NUMERO) erro("whatsapp", rel(p) + ": achei " + JSON.stringify(m[0]) + ", que normaliza para " + d + " e não bate com " + NUMERO);
  }
}

/* 3. A contagem de projetos entregues aparece em quatro lugares.
   Números diferentes na mesma página é o tipo de coisa que ninguém percebe. */
const js = fs.readFileSync(path.join(DOCS, "assets", "js", "site.js"), "utf8");
const contagens = new Set();
(js.match(/total_entregue:\s*(\d+)/g) || []).forEach(t => contagens.add(t.replace(/\D/g, "")));
(js.match(/entregou (\d+) projetos/g) || []).forEach(t => contagens.add(t.replace(/\D/g, "")));
(js.match(/delivered (\d+) projects/g) || []).forEach(t => contagens.add(t.replace(/\D/g, "")));
/* Por extenso e em algarismo, todas as ocorrências de cada página: escrever
   "8 sistemas entregues" é a forma mais natural, e antes ela escapava inteira
   da checagem. Vai de um a vinte porque acima disso ninguém escreve por
   extenso. */
const PALAVRAS = {
  um: 1, one: 1, dois: 2, two: 2, tres: 3, três: 3, three: 3, quatro: 4, four: 4,
  cinco: 5, five: 5, seis: 6, six: 6, sete: 7, seven: 7, oito: 8, eight: 8,
  nove: 9, nine: 9, dez: 10, ten: 10, onze: 11, eleven: 11, doze: 12, twelve: 12,
  treze: 13, thirteen: 13, quatorze: 14, catorze: 14, fourteen: 14, quinze: 15,
  fifteen: 15, dezesseis: 16, sixteen: 16, dezessete: 17, seventeen: 17,
  dezoito: 18, eighteen: 18, dezenove: 19, nineteen: 19, vinte: 20, twenty: 20,
};
const CONTAGEM = /([A-Za-zÀ-ÿ]+|\d+)\s+(?:sistemas? entregues?|systems? delivered)/gi;
for (const [p, s] of conteudo) {
  let m; CONTAGEM.lastIndex = 0;
  while ((m = CONTAGEM.exec(s))) {
    const bruto = m[1].toLowerCase();
    const n = /^\d+$/.test(bruto) ? Number(bruto) : PALAVRAS[bruto];
    if (n === undefined) {
      aviso("projetos", rel(p) + ': achei "' + m[0].trim() + '" e não sei ler esse número. Confira à mão.');
      continue;
    }
    contagens.add(String(n));
  }
}
if (contagens.size > 1) {
  erro("projetos", "a quantidade de projetos entregues está escrita de formas diferentes: " + [...contagens].join(", ")
    + ". Confira docs/index.html, docs/en/index.html e docs/assets/js/site.js.");
}

/* 3b. $ devolve um elemento e $$ devolve um array. Chamar .map, .forEach ou
   .filter no resultado de $ lança TypeError, e só na hora em que a função é
   chamada, o que numa ferramenta WebMCP significa quebrar em produção sem
   ninguém ver. Já aconteceu duas vezes neste arquivo. */
const CHAMADA_ERRADA = /(?<!\$)\$\([^)]*\)\.(map|forEach|filter|slice|some|every)\b/g;
{
  const linhas = js.split("\n");
  linhas.forEach((l, i) => {
    CHAMADA_ERRADA.lastIndex = 0;
    if (CHAMADA_ERRADA.test(l)) {
      erro("javascript", "docs/assets/js/site.js:" + (i + 1) + " chama método de lista no resultado de $(), que devolve um elemento só. Use $$().\n        " + l.trim());
    }
  });
}

/* 3c. A regra html[data-anim] do CSS esconde os mesmos elementos que o
   JavaScript anima na entrada, para não haver piscar. Se as duas listas
   divergirem, ou algo fica escondido para sempre, ou volta o piscar. */
{
  const pegar = re => { const m = js.match(re); return m ? m[1] : null; };
  const entrada = pegar(/var SEL_ENTRADA = "([^"]+)"/);
  const revela = pegar(/var SEL_REVELA = "([^"]+)"/);
  const cssRegra = fs.readFileSync(path.join(DOCS, "assets", "css", "site.css"), "utf8")
    .match(/html\[data-anim\] :where\(([\s\S]*?)\)\s*\{/);
  if (!entrada || !revela) erro("animacao", "não achei SEL_ENTRADA ou SEL_REVELA em site.js.");
  else if (!cssRegra) erro("animacao", "não achei a regra html[data-anim] :where(...) em site.css.");
  else {
    const norm = s => s.split(",").map(x => x.trim().replace(/\s+/g, " ")).filter(Boolean).sort().join(" | ");
    const noJs = norm(entrada + ", " + revela);
    const noCss = norm(cssRegra[1]);
    if (noJs !== noCss) {
      erro("animacao", "a lista de html[data-anim] em site.css não bate com SEL_ENTRADA mais SEL_REVELA em site.js.\n"
        + "        css: " + noCss + "\n        js : " + noJs);
    }
  }
}

/* 3c-bis. O ponto de corte da tela larga está escrito no CSS, na @media do
   leque, e no JavaScript, em CONSULTA_LARGA. Se os dois divergirem, o CSS
   entra em modo leque enquanto o JavaScript continua em modo carrossel, e
   ninguém junta os dois até alguém recarregar a página. */
{
  const cssTexto = fs.readFileSync(path.join(DOCS, "assets", "css", "site.css"), "utf8");
  const noJs = (js.match(/var CONSULTA_LARGA = "([^"]+)"/) || [])[1];
  const noCss = (cssTexto.match(/@media \(min-width: \d+px\) and \(hover: hover\) \{\s*\n\s*\.leque \{/) || [])[0];
  const consultaCss = noCss ? noCss.match(/\(min-width: \d+px\) and \(hover: hover\)/)[0] : null;
  if (!noJs) erro("animacao", "não achei CONSULTA_LARGA em site.js.");
  else if (!consultaCss) erro("animacao", "não achei a @media do leque em site.css.");
  else if (noJs !== consultaCss) {
    erro("animacao", "o ponto de corte da tela larga difere entre os dois arquivos.\n"
      + "        css: " + consultaCss + "\n        js : " + noJs);
  }
}

/* 3d. llms.txt existe para uma ferramenta de IA não ter que adivinhar. Resumo
   desatualizado é pior que resumo nenhum, e ele desatualiza calado. Confere o
   que dá para conferir por máquina: a lista de tecnologias e o nome da API. */
{
  const llms = fs.readFileSync(path.join(DOCS, "llms.txt"), "utf8");
  const pagina = fs.readFileSync(path.join(DOCS, "index.html"), "utf8");
  const bloco = pagina.match(/<div class="chips">([\s\S]*?)<\/div>/);
  if (bloco) {
    const naPagina = (bloco[1].match(/<span>([^<]+)<\/span>/g) || []).map(m => m.replace(/<\/?span>/g, "").trim());
    const linha = llms.match(/^## Tecnologias\s*\n+([^\n]+)/m);
    if (!linha) erro("llms", "docs/llms.txt não tem a seção Tecnologias.");
    else {
      // trim antes do ponto final: em clone no Windows a linha termina com \r,
      // e sem isto o último item vinha com o ponto grudado e nunca batia.
      const noResumo = linha[1].trim().replace(/\.$/, "").split(",").map(t => t.trim());
      const faltando = naPagina.filter(t => noResumo.indexOf(t) < 0);
      const sobrando = noResumo.filter(t => naPagina.indexOf(t) < 0);
      if (faltando.length || sobrando.length) {
        erro("llms", "a lista de tecnologias de docs/llms.txt não bate com a da página."
          + (faltando.length ? "\n        falta no llms.txt: " + faltando.join(", ") : "")
          + (sobrando.length ? "\n        sobra no llms.txt: " + sobrando.join(", ") : ""));
      }
    }
  }
  const apiNoJs = js.indexOf("document.modelContext") > -1;
  if (apiNoJs && !/document\.modelContext/.test(llms)) {
    erro("llms", "docs/llms.txt descreve uma API WebMCP diferente da que site.js usa.");
  }
}

/* 4. Nada de arquivo de trabalho dentro de docs/.
   O motivo de docs/ existir é que o repositório inteiro ia para o ar. */
const PERMITIDO = /\.(html|css|js|png|jpg|jpeg|svg|ico|webmanifest|xml|txt|woff2?)$/;
for (const p of todos) {
  const nome = path.basename(p);
  if (nome === "CNAME" || nome === ".gitkeep") continue;
  if (!PERMITIDO.test(nome)) erro("estrutura", rel(p) + " está publicado e não parece arquivo de site. Nota de trabalho e template vão para tools/.");
  if (/^(README|LEIA-ME|NOTAS|TODO)/i.test(nome)) erro("estrutura", rel(p) + " é nota de trabalho dentro da pasta publicada.");
}

/* 5. Sitemap contra a realidade, nos dois sentidos. */
const sitemap = fs.readFileSync(path.join(DOCS, "sitemap.xml"), "utf8");
const locs = (sitemap.match(/<loc>([^<]+)<\/loc>/g) || []).map(l => l.replace(/<\/?loc>/g, ""));
const paraArquivo = u => {
  if (u.indexOf(DOMINIO) !== 0) return null;
  let r = u.slice(DOMINIO.length) || "/";
  if (r.endsWith("/")) r += "index.html";
  return path.join(DOCS, r.replace(/^\//, "").split("/").join(path.sep));
};
for (const u of locs) {
  const f = paraArquivo(u);
  if (!f) { erro("sitemap", u + " não é do domínio do site."); continue; }
  if (!fs.existsSync(f)) erro("sitemap", u + " está no sitemap e o arquivo " + rel(f) + " não existe.");
}
const noSitemap = new Set(locs.map(u => { const f = paraArquivo(u); return f && rel(f); }));
for (const p of paginas) {
  if (path.basename(p) === "404.html") continue;
  if (!noSitemap.has(rel(p))) erro("sitemap", rel(p) + " existe e não está no sitemap.");
}

/* 6. Todo caminho citado no HTML tem que existir.
   Imagem de compartilhamento quebrada some do WhatsApp sem avisar. */
const CAMINHO = /(?:href|src|content)="((?:\/|https:\/\/openseed\.com\.br\/)[^"#?]*\.(?:png|jpg|jpeg|svg|ico|css|js|webmanifest|xml|txt))"/g;
for (const [p, s] of semComentario) {
  let m; CAMINHO.lastIndex = 0;
  while ((m = CAMINHO.exec(s))) {
    const u = m[1].indexOf("http") === 0 ? m[1] : DOMINIO + m[1];
    const f = paraArquivo(u);
    if (f && !fs.existsSync(f)) erro("caminho", rel(p) + " aponta para " + m[1] + ", que não existe.");
  }
}

/* 6b. Todo link interno leva a uma página que existe.
   Renomear arquivo e esquecer um link é o erro mais barato de cometer. */
const LINK = /href="([^"]+)"/g;
for (const [p, s] of semComentario) {
  let m; LINK.lastIndex = 0;
  while ((m = LINK.exec(s))) {
    const h = m[1];
    if (/^(https?:|mailto:|tel:|data:|#)/.test(h)) continue;
    let destino = h.split("#")[0].split("?")[0];
    if (!destino) continue;
    let f = destino[0] === "/"
      ? path.join(DOCS, destino.slice(1).split("/").join(path.sep))
      : path.join(path.dirname(p), destino.split("/").join(path.sep));
    if (destino.endsWith("/")) f = path.join(f, "index.html");
    if (!fs.existsSync(f)) erro("link", rel(p) + " aponta para " + h + ", que não existe.");
  }
}

/* 7. Canonical aponta para a própria página. */
for (const [p, s] of conteudo) {
  if (path.basename(p) === "404.html") continue;
  const m = s.match(/<link rel="canonical" href="([^"]+)"/);
  if (!m) { erro("canonical", rel(p) + " não tem canonical."); continue; }
  const esperado = DOMINIO + url(p).replace(/\/index\.html$/, "/").replace(/^\/index\.html$/, "/");
  if (m[1] !== esperado) erro("canonical", rel(p) + " tem canonical " + m[1] + " e deveria ter " + esperado + ".");
}

/* 8. As duas línguas se apontam nos dois sentidos. */
const pt = path.join(DOCS, "index.html"), en = path.join(DOCS, "en", "index.html");
if (fs.existsSync(pt) && fs.existsSync(en)) {
  const par = [[pt, "en", DOMINIO + "/en/"], [en, "pt-BR", DOMINIO + "/"]];
  for (const [p, lang, destino] of par) {
    const s = conteudo.get(p);
    const declara = new RegExp('hreflang="' + lang + '" href="' + destino.replace(/[/.]/g, m => "\\" + m) + '"', "i");
    if (!declara.test(s)) erro("hreflang", rel(p) + " não declara hreflang " + lang + " para " + destino + ".");
    if (s.indexOf('hreflang="x-default"') < 0) erro("hreflang", rel(p) + " não declara x-default.");
  }
}

/* 9. Card de exemplo tem que continuar marcado, senão vira caso entregue
   na resposta de um agente de IA. */
for (const [p, s] of conteudo) {
  if (s.indexOf('class="proj"') < 0) continue;
  /* Os títulos que o molde de tools/capas-de-projeto.md pode deixar para trás.
     Quem cola o molde e esquece de preencher cai aqui. */
  const moldes = (s.match(/<h3>(?:Nome do projeto|Project name|Nome ou apelido do sistema|Project name or nickname)<\/h3>/g) || []).length;
  const marcados = (s.match(/<article class="proj"[^>]*\bdata-exemplo\b/g) || []).length;
  if (moldes > marcados) {
    erro("projetos", rel(p) + " tem " + moldes + " card(s) com título de molde e só " + marcados
      + " com data-exemplo. Card sem o atributo é devolvido a agente de IA como projeto entregue.");
  }
  if (marcados > moldes) {
    aviso("projetos", rel(p) + " tem " + marcados + " card(s) com data-exemplo e " + moldes
      + " com título de molde. Preencheu o card? Apague o data-exemplo.");
  }
}

for (const a of avisos) console.log("aviso  " + a);
if (!problemas.length) {
  console.log("\ntudo certo: " + paginas.length + " páginas, " + todos.length + " arquivos publicados.");
  process.exit(0);
}
console.error("\n" + problemas.length + " problema(s):\n");
for (const p of problemas) console.error("  " + p);
process.exit(1);
