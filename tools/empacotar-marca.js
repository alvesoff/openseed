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

const LEIAME = `MARCA OPENSEED
==============

O que tem aqui
--------------

openseed-marca.svg              cores da marca, para fundo escuro
openseed-marca-preta.svg        uma cor só, para fundo claro
openseed-marca-branca.svg       uma cor só, para fundo colorido ou foto
openseed-marca-1024.png         cores da marca, 1024 px de largura, fundo transparente
openseed-marca-2048.png         a mesma, 2048 px, para impressão e tela grande
openseed-marca-preta-1024.png   preta, 1024 px, fundo transparente
openseed-marca-branca-1024.png  branca, 1024 px, fundo transparente

Prefira o SVG sempre que der. Ele não perde qualidade em nenhum tamanho e o
texto já está em contorno, então não depende de a fonte estar instalada.

As cores
--------

Verde-limão   #c6f24e   a palavra OPEN
Branco-osso   #f4f4f0   a palavra SEED
Preto-carvão  #0a0a0a   o fundo da marca

O verde-limão sobre branco dá 1,4 de contraste e não se lê. Em fundo claro use
a versão preta, nunca a colorida.

Como usar
---------

Respeite uma margem livre em volta da marca do tamanho da altura da palavra
OPEN. Nada entra nesse espaço.

Não estique, não incline, não troque as cores, não ponha sombra, não redesenhe
o espaçamento entre as letras. Se precisar de uma versão que não está aqui,
peça em contato@openseed.com.br.

A marca é composta em Outfit Black. O texto destes arquivos já está
convertido em contorno, então nada aqui depende da fonte.
`;

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

/* Data fixa dentro do ZIP. Sem isto, cada execução gera bytes diferentes só
   pelo relógio, e o --conferir acusaria mudança em arquivo idêntico. */
const DATA_FIXA = { hora: 0, data: (2026 - 1980) << 9 | (1 << 5) | 1 };

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

/* ---------------------------------------------------------------- USO */
const membros = fs.readdirSync(PASTA)
  .filter(n => /\.(svg|png)$/.test(n))
  .sort()
  .map(n => ({ nome: "openseed-marca/" + n, dados: fs.readFileSync(path.join(PASTA, n)) }));

if (!membros.length) { console.error("nenhum arquivo de marca em " + PASTA); process.exit(1); }
membros.unshift({ nome: "openseed-marca/LEIA-ME.txt", dados: Buffer.from(LEIAME, "utf8") });

const novo = zip(membros);
const atual = fs.existsSync(PACOTE) ? fs.readFileSync(PACOTE) : null;

if (atual && atual.equals(novo)) {
  console.log("igual: o pacote já contém estes " + membros.length + " arquivos");
  process.exit(0);
}
if (conferir) {
  console.error("DIFERE: docs/assets/marca/openseed-marca.zip não bate com os arquivos da pasta.");
  console.error("Rode sem --conferir para refazer o pacote.");
  process.exit(1);
}
fs.writeFileSync(PACOTE, novo);
console.log("escrito: docs/assets/marca/openseed-marca.zip");
membros.forEach(m => console.log("  " + m.nome + " (" + m.dados.length + " bytes)"));
console.log("total: " + novo.length + " bytes");
