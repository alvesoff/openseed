# openseed.com.br no Registro.br

O site é servido pelo GitHub Pages a partir da branch `main`. O arquivo `CNAME`
na raiz é o que diz ao GitHub qual é o domínio — não apague.

## Os registros para criar no Registro.br

Entre em **registro.br → Painel → openseed.com.br → DNS → Editar Zona**.
Isso só funciona se o domínio estiver usando o **DNS do Registro.br**; se estiver
apontado para outro provedor (Cloudflare etc.), crie os mesmos registros lá.

### 1. Quatro registros A — apontam o domínio raiz para o GitHub

| Nome | Tipo | Dados |
| --- | --- | --- |
| *(deixe vazio)* | A | `185.199.108.153` |
| *(deixe vazio)* | A | `185.199.109.153` |
| *(deixe vazio)* | A | `185.199.110.153` |
| *(deixe vazio)* | A | `185.199.111.153` |

São quatro mesmo — é redundância do GitHub. Criar só um funciona pior.

### 2. Quatro registros AAAA — o mesmo, para IPv6

| Nome | Tipo | Dados |
| --- | --- | --- |
| *(vazio)* | AAAA | `2606:50c0:8000::153` |
| *(vazio)* | AAAA | `2606:50c0:8001::153` |
| *(vazio)* | AAAA | `2606:50c0:8002::153` |
| *(vazio)* | AAAA | `2606:50c0:8003::153` |

Opcionais, mas sem eles quem estiver em rede só-IPv6 não abre o site.

### 3. Um CNAME — para o `www` cair no mesmo lugar

| Nome | Tipo | Dados |
| --- | --- | --- |
| `www` | CNAME | `alvesoff.github.io.` |

O ponto final no fim faz parte. O GitHub redireciona `www` para a raiz sozinho.

### Se o painel pedir formato de zona (texto)

```
@     3600  IN  A      185.199.108.153
@     3600  IN  A      185.199.109.153
@     3600  IN  A      185.199.110.153
@     3600  IN  A      185.199.111.153
@     3600  IN  AAAA   2606:50c0:8000::153
@     3600  IN  AAAA   2606:50c0:8001::153
@     3600  IN  AAAA   2606:50c0:8002::153
@     3600  IN  AAAA   2606:50c0:8003::153
www   3600  IN  CNAME  alvesoff.github.io.
```

## Depois de salvar no Registro.br

1. **Espere a propagação.** Costuma levar de alguns minutos a algumas horas.
   Para conferir, no PowerShell: `Resolve-DnsName openseed.com.br -Type A`
   — tem que devolver os quatro IPs `185.199.10x.153`.

2. **Ligue o HTTPS.** Em github.com/alvesoff/openseed → Settings → Pages, marque
   **Enforce HTTPS**. A opção só fica disponível depois que o DNS propaga e o
   GitHub emite o certificado (Let's Encrypt, automático) — pode levar mais uma
   hora depois do DNS ficar pronto. Enquanto não aparecer, é só esperar.

3. **Confira o preview do link.** Cole `https://openseed.com.br` no
   [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) e
   clique em *Scrape Again*, para o `og-image.png` novo aparecer no WhatsApp e
   nas redes.

## Se der errado

- **"Domain's DNS record could not be retrieved"** no Settings → Pages: o DNS
  ainda não propagou. Espere e clique em *Check again*.
- **Site abre em HTTP mas não em HTTPS:** o certificado ainda não saiu. Não
  marque *Enforce HTTPS* antes de a opção liberar sozinha.
- **404 no domínio:** confira se o arquivo `CNAME` na raiz do repo ainda existe
  e tem exatamente `openseed.com.br` dentro, sem `https://` e sem barra.
