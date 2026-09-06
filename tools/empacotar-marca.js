// Empacota os arquivos da marca num ZIP, para o link baixar em vez de abrir.
//
// Por que um ZIP: o GitHub Pages não deixa mandar cabeçalho, e sem
// Content-Disposition o navegador ABRE um SVG ou um PNG em vez de baixar.
// Com .zip ele baixa, porque não sabe exibir. É a única forma de ter um link
// que baixa num site estático.
//
//   node tools/empacotar-marca.js             gera o pacote
//   node tools/empacotar-marca.js --conferir  só compara com o que está lá
//
// Sem dependência: o ZIP é escrito à mão, com deflate do zlib do Node.

const fs = require("fs"), path = require("path"), zlib = require("zlib");

const PASTA = path.join(__dirname, "..", "docs", "assets", "marca");
const PACOTE = path.join(PASTA, "openseed-marca.zip");
const conferir = process.argv.indexOf("--conferir") > -1;

/* O que cada arquivo é. O inventário do LEIA-ME é montado a partir da pasta e
   consultado aqui: acrescentar uma variante sem descrever derruba o script, em
   vez de entregar um pacote cujo texto mente sobre o próprio conteúdo. */
const DESCRICOES = {
  "openseed-marca.svg": "cores da marca, para fundo escuro",
  "openseed-marca-preta.svg": "uma cor só, para fundo claro",
  "openseed-marca-branca.svg": "uma cor só, para fundo colorido ou foto",
  "openseed-marca-1024.png": "cores da marca, 1024 px de largura, fundo transparente",
  "openseed-marca-2048.png": "a mesma, 2048 px, para impressão e tela grande",
  "openseed-marca-preta-1024.png": "preta, 1024 px, fundo transparente",
  "openseed-marca-branca-1024.png": "branca, 1024 px, fundo transparente",
  "openseed-instagram-perfil.png": "foto de perfil do Instagram, 1080 x 1080",
};

function leiame(inventario) {
  return [
    "MARCA OPENSEED",
    "==============",
    "",
    "O que tem aqui",
    "--------------",
    "",
    inventario,
    "",
    "Prefira o SVG sempre que der. Ele não perde qualidade em nenhum tamanho e o",
    "texto já está em contorno, então não depende de a fonte estar instalada.",
    "",
    "As cores",
    "--------",
    "",
    "Verde-limão   #c6f24e   a palavra OPEN",
    "Branco-osso   #f4f4f0   a palavra SEED",
    "Preto-carvão  #0a0a0a   o fundo da marca",
    "",
    "O verde-limão sobre branco dá 1,4 de contraste e não se lê. Em fundo claro use",
    "a versão preta, nunca a colorida.",
    "",
    "A foto de perfil do Instagram",
    "-----------------------------",
    "",
    "openseed-instagram-perfil.png já está pronta para subir: 1080 por 1080, que é",
    "o que o Instagram reamostra sem borrar em tela densa.",
    "",
    "A marca ocupa 76% da largura de propósito. O Instagram recorta a foto em",
    "círculo e os cantos do quadrado somem; e quando há story ativo ele ainda",
    "desenha um anel em volta e encolhe a imagem um pouco. Os 76% deixam folga para",
    "os dois. Não aumente a marca para aproveitar o espaço: o espaço não é seu.",
    "",
    "Como usar",
    "---------",
    "",
    "Respeite uma margem livre em volta da marca do tamanho da altura da palavra",
    "OPEN. Nada entra nesse espaço.",
    "",
    "Não estique, não incline, não troque as cores, não ponha sombra, não redesenhe",
    "o espaçamento entre as letras. Se precisar de uma versão que não está aqui,",
    "peça em contato@openseed.com.br.",
    "",
    "A marca é composta em Outfit Black. O texto destes arquivos já está",
    "convertido em contorno, então nada aqui depende da fonte.",
    "",
  ].join("\n");
}

/* ------------------------------------------------------------------ ZIP */
const TABELA_CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = TABELA_CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

/* Data fixa dentro do ZIP: sem isto o relógio entraria nos bytes e dois
   pacotes de conteúdo idêntico sairiam diferentes. */
const DATA_FIXA = { hora: 0, data: ((2026 - 1980) << 9) | (1 << 5) | 1 };

function zip(entradas) {
  const locais = [], centrais = [];
  let deslocamento = 0;
  for (const { nome, dados } of entradas) {
    const nomeBuf = Buffer.from(nome, "utf8");
    const comprimido = zlib.deflateRawSync(dados, { level: 9 });
    const usaDeflate = comprimido.length < dados.length;
    const corpo = usaDeflate ? comprimido : dados;
    const metodo = usaDeflate ? 8 : 0;
    const soma = crc32(dados);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);            // versão mínima
    local.writeUInt16LE(0x0800, 6);        // nome em UTF-8
    local.writeUInt16LE(metodo, 8);
    local.writeUInt16LE(DATA_FIXA.hora, 10);
    local.writeUInt16LE(DATA_FIXA.data, 12);
    local.writeUInt32LE(soma, 14);
    local.writeUInt32LE(corpo.length, 18);
    local.writeUInt32LE(dados.length, 22);
    local.writeUInt16LE(nomeBuf.length, 26);
    local.writeUInt16LE(0, 28);
    locais.push(local, nomeBuf, corpo);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);          // versão de quem escreveu
    central.writeUInt16LE(20, 6);          // versão mínima
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(metodo, 10);
    central.writeUInt16LE(DATA_FIXA.hora, 12);
    central.writeUInt16LE(DATA_FIXA.data, 14);
    central.writeUInt32LE(soma, 16);
    central.writeUInt32LE(corpo.length, 20);
    central.writeUInt32LE(dados.length, 24);
    central.writeUInt16LE(nomeBuf.length, 28);
    central.writeUInt32LE(deslocamento, 42);
    centrais.push(central, nomeBuf);

    deslocamento += local.length + nomeBuf.length + corpo.length;
  }
  const corpoCentral = Buffer.concat(centrais);
  const fim = Buffer.alloc(22);
  fim.writeUInt32LE(0x06054b50, 0);
  fim.writeUInt16LE(entradas.length, 8);
  fim.writeUInt16LE(entradas.length, 10);
  fim.writeUInt32LE(corpoCentral.length, 12);
  fim.writeUInt32LE(deslocamento, 16);
  return Buffer.concat([Buffer.concat(locais), corpoCentral, fim]);
}

/* Lê nome, tamanho e CRC de cada membro pelo diretório central.
   Comparar por CRC, e não pelos bytes do arquivo inteiro, é o que impede a
   checagem de amarrar numa versão específica do zlib: outra versão comprime
   diferente e devolve o mesmo CRC, porque ele é calculado sobre o conteúdo
   cru. Sem isso, um clone intocado falharia noutra máquina. */
function lerZip(buf) {
  let fim = -1;
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 65558; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { fim = i; break; }
  }
  if (fim < 0) return null;
  const quantos = buf.readUInt16LE(fim + 10);
  let p = buf.readUInt32LE(fim + 16);
  const membros = {};
  for (let i = 0; i < quantos; i++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== 0x02014b50) return null;
    const crc = buf.readUInt32LE(p + 16);
    const tamanho = buf.readUInt32LE(p + 24);
    const nomeLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const comentLen = buf.readUInt16LE(p + 32);
    membros[buf.toString("utf8", p + 46, p + 46 + nomeLen)] = { crc, tamanho };
    p += 46 + nomeLen + extraLen + comentLen;
  }
  return membros;
}

/* ---------------------------------------------------------------- USO */
if (!fs.existsSync(PASTA)) { console.error("pasta da marca não existe: " + PASTA); process.exit(1); }

const membros = fs.readdirSync(PASTA)
  .filter(n => /\.(svg|png)$/.test(n))
  .sort()
  .map(n => ({ nome: "openseed-marca/" + n, dados: fs.readFileSync(path.join(PASTA, n)) }));

if (!membros.length) { console.error("nenhum arquivo de marca em " + PASTA); process.exit(1); }

const semDescricao = membros.map(m => path.basename(m.nome)).filter(n => !DESCRICOES[n]);
if (semDescricao.length) {
  console.error("arquivo de marca sem descrição em DESCRICOES, no topo deste script:");
  semDescricao.forEach(n => console.error("  " + n));
  console.error("Descreva cada um: o inventário do LEIA-ME é montado a partir dessa lista.");
  process.exit(1);
}

const larguraNome = Math.max(...membros.map(m => path.basename(m.nome).length)) + 2;
const inventario = membros
  .map(m => { const n = path.basename(m.nome); return n.padEnd(larguraNome) + DESCRICOES[n]; })
  .join("\n");
membros.unshift({ nome: "openseed-marca/LEIA-ME.txt", dados: Buffer.from(leiame(inventario), "utf8") });

const esperado = {};
membros.forEach(m => { esperado[m.nome] = { crc: crc32(m.dados), tamanho: m.dados.length }; });
const atual = fs.existsSync(PACOTE) ? lerZip(fs.readFileSync(PACOTE)) : null;

const igual = atual
  && Object.keys(atual).length === Object.keys(esperado).length
  && Object.keys(esperado).every(n => atual[n] && atual[n].crc === esperado[n].crc && atual[n].tamanho === esperado[n].tamanho);

if (igual) {
  console.log("igual: o pacote já contém estes " + membros.length + " arquivos");
  process.exit(0);
}
if (conferir) {
  console.error("DIFERE: docs/assets/marca/openseed-marca.zip não bate com os arquivos da pasta.");
  const nomes = new Set(Object.keys(esperado).concat(Object.keys(atual || {})));
  for (const n of [...nomes].sort()) {
    const a = atual && atual[n], e = esperado[n];
    if (!a) console.error("  falta no pacote: " + n);
    else if (!e) console.error("  sobra no pacote: " + n);
    else if (a.crc !== e.crc || a.tamanho !== e.tamanho) console.error("  mudou: " + n);
  }
  console.error("Rode sem --conferir para refazer o pacote.");
  process.exit(1);
}

fs.writeFileSync(PACOTE, zip(membros));
console.log("escrito: docs/assets/marca/openseed-marca.zip");
membros.forEach(m => console.log("  " + m.nome + " (" + m.dados.length + " bytes)"));
console.log("total: " + fs.statSync(PACOTE).size + " bytes");
