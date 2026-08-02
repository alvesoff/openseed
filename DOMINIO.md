# openseed.com.br no Registro.br

O site é servido pelo GitHub Pages a partir da branch `main`. O arquivo `CNAME`
na raiz é o que diz ao GitHub qual é o domínio. Não apague.

> **Estado atual (02/08/2026):** no ar em https://openseed.com.br com certificado
> Let's Encrypt válido para o apex e o `www`, e *Enforce HTTPS* ligado. O passo a
> passo abaixo fica como referência para refazer ou migrar o domínio.

## Os registros para criar no Registro.br

Entre em **registro.br → Painel → openseed.com.br → DNS → Editar Zona**.
Isso só funciona se o domínio estiver usando o **DNS do Registro.br**; se estiver
apontado para outro provedor (Cloudflare etc.), crie os mesmos registros lá.

### 1. Quatro registros A, que apontam o domínio raiz para o GitHub

| Nome | Tipo | Dados |
| --- | --- | --- |
| *(deixe vazio)* | A | `185.199.108.153` |
| *(deixe vazio)* | A | `185.199.109.153` |
| *(deixe vazio)* | A | `185.199.110.153` |
| *(deixe vazio)* | A | `185.199.111.153` |

São quatro mesmo, é redundância do GitHub. Criar só um funciona pior.

### 2. Quatro registros AAAA, o mesmo para IPv6

| Nome | Tipo | Dados |
| --- | --- | --- |
| *(vazio)* | AAAA | `2606:50c0:8000::153` |
| *(vazio)* | AAAA | `2606:50c0:8001::153` |
| *(vazio)* | AAAA | `2606:50c0:8002::153` |
| *(vazio)* | AAAA | `2606:50c0:8003::153` |

Opcionais, mas sem eles quem estiver em rede só-IPv6 não abre o site.

### 3. Um CNAME, para o `www` cair no mesmo lugar

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
   Tem que devolver os quatro IPs `185.199.10x.153`.

2. **Ligue o HTTPS.** Em github.com/alvesoff/openseed → Settings → Pages, marque
   **Enforce HTTPS**. A opção só fica disponível depois que o DNS propaga e o
   GitHub emite o certificado (Let's Encrypt, automático) e costuma levar mais
   uma hora depois do DNS ficar pronto.

   Se passar de umas 3 horas e a caixa continuar cinza, pare de esperar e vá
   checar a seção *Validação travada* mais abaixo. A documentação do GitHub fala
   em até 24h, mas se a validação travou o relógio não vai resolver, e o
   diagnóstico é um comando só.

3. **Confira o preview do link.** Cole `https://openseed.com.br` no
   [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) e
   clique em *Scrape Again*, para o `og-image.png` novo aparecer no WhatsApp e
   nas redes.

## Se der errado

- **"Domain's DNS record could not be retrieved"** no Settings → Pages: o DNS
  ainda não propagou. Espere e clique em *Check again*.
- **Site abre em HTTP mas não em HTTPS:** o certificado ainda não saiu. Nas
  primeiras horas é normal, então não marque *Enforce HTTPS* antes de a opção liberar
  sozinha. Se demorar muito, veja *Validação travada* abaixo.
- **404 no domínio:** confira se o arquivo `CNAME` na raiz do repo ainda existe
  e tem exatamente `openseed.com.br` dentro, sem `https://` e sem barra.

### Validação travada: o certificado nunca sai, mesmo com o DNS certo

Aconteceu aqui em 02/08/2026 e é a armadilha menos óbvia desse processo. O GitHub
valida o domínio no momento em que ele é definido, ou seja, quando o arquivo
`CNAME` entra no repo. Se naquele instante o DNS ainda não apontava pro GitHub, a
validação falha e **ele não retenta sozinho**. A emissão do certificado fica atrás
dessa validação, então o site serve em HTTP normalmente e o HTTPS nunca sobe.

**Como reconhecer:** na API, `https_certificate` vem *ausente* da resposta. Não é
`state: new` nem `authorization_pending`, a chave simplesmente não existe. E a porta
443 responde com o curinga `CN=*.github.io` em vez do seu domínio.

```bash
gh api repos/alvesoff/openseed/pages --jq '{cname, https_enforced, cert: (.https_certificate.state // "AUSENTE")}'
```

**Antes de mexer, descarte as causas de DNS**, que dão o mesmo sintoma:

```powershell
# 1. CAA. Um registro CAA pode barrar o Let's Encrypt.
#    NÃO use Resolve-DnsName -Type CAA nem nslookup -type=CAA no Windows:
#    o primeiro nem aceita "CAA" no enum e o segundo devolve registros A
#    caladamente. Pergunte por DNS-over-HTTPS:
curl.exe -s "https://dns.google/resolve?name=openseed.com.br&type=CAA" | ConvertFrom-Json |
  Select-Object Status, Answer
# Status 0 e sem "Answer" = não há CAA, Let's Encrypt liberado.

# 2. DNSSEC quebrado. O 8.8.8.8 valida; se a cadeia estiver ruim ele dá SERVFAIL
#    e o Let's Encrypt enxerga o mesmo, mesmo que o seu resolver local responda.
Resolve-DnsName openseed.com.br -Server 8.8.8.8 -Type A
```

**O que não resolve:** reenviar o mesmo domínio (`-f cname=openseed.com.br` com o
valor que já está lá). É no-op, porque o GitHub não re-roda a validação quando o valor não
muda. Esperar também não resolve.

**O que resolve:** forçar uma mudança real de valor, ida e volta. É bem menos
invasivo que remover e recolocar o domínio, porque o arquivo `CNAME` nunca chega a
ser apagado. No intervalo o site continua publicado, com o apex redirecionando pro
`www`. Ainda assim o Pages passa por `status: building` nas duas trocas, então conte
com alguns segundos instáveis; não faça em horário de pico.

```bash
gh api -X PUT repos/alvesoff/openseed/pages -f cname=www.openseed.com.br
# espere ~1 min, depois volte pro apex
gh api -X PUT repos/alvesoff/openseed/pages -f cname=openseed.com.br
# cert vira "approved" em segundos; então ligue o Enforce HTTPS:
gh api -X PUT repos/alvesoff/openseed/pages -F https_enforced=true
```

Repare no `-F` (não `-f`) no último comando: `https_enforced` é boolean, e com `-f`
a API devolve 422. Cada troca gera um commit automático "Update CNAME" na `main`,
dê `git pull` depois.

Para confirmar que o certificado é mesmo o seu, e não o curinga:

```powershell
$tcp = [Net.Sockets.TcpClient]::new('openseed.com.br', 443)
$ssl = [Net.Security.SslStream]::new($tcp.GetStream(), $false, { $true })
$ssl.AuthenticateAsClient('openseed.com.br')
$c = [Security.Cryptography.X509Certificates.X509Certificate2]$ssl.RemoteCertificate
"Issuer: $($c.Issuer)"
($c.Extensions | Where-Object { $_.Oid.Value -eq '2.5.29.17' }).Format($false)
$ssl.Dispose(); $tcp.Close()
```

Tem que sair `Issuer: CN=…, O=Let's Encrypt` e o SAN listando `openseed.com.br` e
`www.openseed.com.br`. Não estranhe o `Subject` do certificado vir como
`CN=www.openseed.com.br`. É só o nome principal; quem vale é o SAN, que cobre os
dois. Se aparecer `CN=*.github.io`, é o curinga e o certificado não saiu.

O teste definitivo é este, que valida cadeia e hostname sem nenhum bypass:

```powershell
Invoke-WebRequest https://openseed.com.br -UseBasicParsing | Select-Object StatusCode
```
