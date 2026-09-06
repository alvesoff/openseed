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
const PALAVRAS = { oito: "8", eight: "8", nove: "9", nine: "9", dez: "10", ten: "10", sete: "7", seven: "7" };
for (const [, s] of conteudo) {
  const m = s.match(/(Oito|Eight|Nove|Nine|Dez|Ten|Sete|Seven) (?:sistemas entregues|systems delivered)/i);
  if (m) contagens.add(PALAVRAS[m[1].toLowerCase()] || m[1]);
}
if (contagens.size > 1) {
  erro("projetos", "a quantidade de projetos entregues está escrita de formas diferentes: " + [...contagens].join(", ")
    + ". Confira docs/index.html, docs/en/index.html e docs/assets/js/site.js.");
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
  const moldes = (s.match(/<h3>(?:Nome do projeto|Project name)<\/h3>/g) || []).length;
  const marcados = (s.match(/<article class="proj" data-exemplo>/g) || []).length;
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
