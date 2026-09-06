// Servidor local que imita o GitHub Pages: raiz em docs/, index.html em pasta,
// 404.html para o que não existe. Uso: node tools/serve.js  (porta 8899)
const http = require("http"), fs = require("fs"), path = require("path");
const raiz = path.join(__dirname, "..", "docs");
const tipos = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json", ".json": "application/json", ".woff2": "font/woff2" };
http.createServer(function (req, res) {
  let url = decodeURIComponent(req.url.split("?")[0]);
  if (url.endsWith("/")) url += "index.html";
  let arq = path.normalize(path.join(raiz, url));
  if (!arq.startsWith(raiz)) { res.writeHead(403); return res.end(); }
  if (!fs.existsSync(arq) && fs.existsSync(arq + ".html")) arq += ".html";
  if (!fs.existsSync(arq) || fs.statSync(arq).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(fs.existsSync(path.join(raiz, "404.html")) ? fs.readFileSync(path.join(raiz, "404.html")) : "404");
  }
  res.writeHead(200, { "Content-Type": tipos[path.extname(arq)] || "application/octet-stream" });
  res.end(fs.readFileSync(arq));
}).listen(8899, "127.0.0.1", function () { console.log("docs/ em http://127.0.0.1:8899"); });
