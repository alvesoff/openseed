# OpenSeed

Site da OpenSeed, estúdio de desenvolvimento de software com IA em Ribeirão Preto, SP.
No ar em **[openseed.com.br](https://openseed.com.br)**, servido pelo GitHub Pages a
partir da pasta `docs/` da branch `main`.

Site estático: HTML, CSS e JavaScript escritos à mão. Sem build, sem dependência para
instalar, sem framework. Editar um arquivo e dar `git push` publica.

---

## Estrutura

```
openseed/
├── docs/                      ← isto, e só isto, vai para o ar
│   ├── index.html             landing em português (página inicial)
│   ├── en/index.html          a mesma página em inglês
│   ├── manifesto.html         manifesto da marca, com o gráfico de conteúdo sintético
│   ├── sobre.html             quem é a OpenSeed e o modelo de trabalho
│   ├── privacidade.html       política de privacidade
│   ├── 404.html               página de erro
│   ├── assets/
│   │   ├── css/site.css       estilo das duas landings
│   │   ├── js/site.js         comportamento das duas landings
│   │   └── img/
│   │       ├── og-image.png   imagem de compartilhamento (1200x630)
│   │       ├── cases/         prints dos projetos, ver tools/capas-de-projeto.md
│   │       └── icons/         favicon (SVG e PNG) e ícones de aplicativo
│   ├── CNAME                  domínio do GitHub Pages, não apagar
│   ├── robots.txt             regras de rastreamento, inclui os robôs de IA
│   ├── sitemap.xml            mapa do site com as duas línguas
│   ├── llms.txt               resumo do site em texto, para ferramentas de IA
│   └── site.webmanifest       nome e ícones ao salvar na tela inicial
│
├── tools/                     ← ferramentas de trabalho, fora do ar
│   ├── serve.js               servidor local que imita o GitHub Pages
│   ├── conferir.js            roda as regras do site antes do PR
│   ├── sincronizar-faq.js     escreve o FAQ do JSON-LD a partir da tela
│   ├── og-image.html          template da imagem de compartilhamento
│   ├── icons.html             template dos ícones
│   ├── capas-de-projeto.md    como publicar o print de um projeto
│   ├── pendencias.md          o que falta e só o dono do negócio pode preencher
│   └── marca/                 arquivos originais da marca
│
├── DOMINIO.md                 como o domínio está configurado no Registro.br
├── PIVOT/                     referências e logo bruta, fora do versionamento
└── README.md                  este arquivo
```

**Por que `docs/` existe.** Antes, o repositório inteiro ia para o ar, e isso incluía
templates que não são páginas do site (`og-image.html`, os arquivos de marca).
Qualquer pessoa conseguia abrir esses HTML soltos no domínio. Agora só `docs/` é
publicado, e o que é ferramenta fica em `tools/`, inalcançável pela web.

A regra não se defende sozinha, então `node tools/conferir.js` reclama de qualquer
arquivo dentro de `docs/` que não pareça arquivo de site.

**O GitHub Pages precisa estar apontado para `/docs`.** É configuração de
repositório, não de código: *Settings → Pages → Source → Deploy from a branch →
main → /docs*. Pela linha de comando:

```bash
gh api -X PUT repos/alvesoff/openseed/pages -f "source[branch]=main" -f "source[path]=/docs"
```

Se um dia o site sair do ar mostrando o README em vez da página, é a primeira coisa
a conferir.

---

## Rodar o site na sua máquina

Precisa de [Node.js](https://nodejs.org) instalado. Nada além disso.

```bash
node tools/serve.js
```

Abra <http://127.0.0.1:8899>. O servidor imita o GitHub Pages: a raiz é `docs/`,
`/en/` carrega `docs/en/index.html` e o que não existe cai no `404.html`.

Para parar, `Ctrl+C`.

---

## Tarefas do dia a dia

### Conferir tudo antes de abrir o PR

```bash
node tools/conferir.js
```

Onze regras que ninguém guarda de cabeça: FAQ visível contra JSON-LD, número de
WhatsApp igual em toda parte, contagem de projetos coerente, `# OpenSeed

Site da OpenSeed, estúdio de desenvolvimento de software com IA em Ribeirão Preto, SP.
No ar em **[openseed.com.br](https://openseed.com.br)**, servido pelo GitHub Pages a
partir da pasta `docs/` da branch `main`.

Site estático: HTML, CSS e JavaScript escritos à mão. Sem build, sem dependência para
instalar, sem framework. Editar um arquivo e dar `git push` publica.

---

## Estrutura

```
openseed/
├── docs/                      ← isto, e só isto, vai para o ar
│   ├── index.html             landing em português (página inicial)
│   ├── en/index.html          a mesma página em inglês
│   ├── manifesto.html         manifesto da marca, com o gráfico de conteúdo sintético
│   ├── sobre.html             quem é a OpenSeed e o modelo de trabalho
│   ├── privacidade.html       política de privacidade
│   ├── 404.html               página de erro
│   ├── assets/
│   │   ├── css/site.css       estilo das duas landings
│   │   ├── js/site.js         comportamento das duas landings
│   │   └── img/
│   │       ├── og-image.png   imagem de compartilhamento (1200x630)
│   │       ├── cases/         prints dos projetos, ver tools/capas-de-projeto.md
│   │       └── icons/         favicon (SVG e PNG) e ícones de aplicativo
│   ├── CNAME                  domínio do GitHub Pages, não apagar
│   ├── robots.txt             regras de rastreamento, inclui os robôs de IA
│   ├── sitemap.xml            mapa do site com as duas línguas
│   ├── llms.txt               resumo do site em texto, para ferramentas de IA
│   └── site.webmanifest       nome e ícones ao salvar na tela inicial
│
├── tools/                     ← ferramentas de trabalho, fora do ar
│   ├── serve.js               servidor local que imita o GitHub Pages
│   ├── conferir.js            roda as regras do site antes do PR
│   ├── sincronizar-faq.js     escreve o FAQ do JSON-LD a partir da tela
│   ├── og-image.html          template da imagem de compartilhamento
│   ├── icons.html             template dos ícones
│   ├── capas-de-projeto.md    como publicar o print de um projeto
│   ├── pendencias.md          o que falta e só o dono do negócio pode preencher
│   └── marca/                 arquivos originais da marca
│
├── DOMINIO.md                 como o domínio está configurado no Registro.br
├── PIVOT/                     referências e logo bruta, fora do versionamento
└── README.md                  este arquivo
```

**Por que `docs/` existe.** Antes, o repositório inteiro ia para o ar, e isso incluía
templates que não são páginas do site (`og-image.html`, os arquivos de marca).
Qualquer pessoa conseguia abrir esses HTML soltos no domínio. Agora só `docs/` é
publicado, e o que é ferramenta fica em `tools/`, inalcançável pela web.

A regra não se defende sozinha, então `node tools/conferir.js` reclama de qualquer
arquivo dentro de `docs/` que não pareça arquivo de site.

**O GitHub Pages precisa estar apontado para `/docs`.** É configuração de
repositório, não de código: *Settings → Pages → Source → Deploy from a branch →
main → /docs*. Pela linha de comando:

```bash
gh api -X PUT repos/alvesoff/openseed/pages -f "source[branch]=main" -f "source[path]=/docs"
```

Se um dia o site sair do ar mostrando o README em vez da página, é a primeira coisa
a conferir.

---

## Rodar o site na sua máquina

Precisa de [Node.js](https://nodejs.org) instalado. Nada além disso.

```bash
node tools/serve.js
```

Abra <http://127.0.0.1:8899>. O servidor imita o GitHub Pages: a raiz é `docs/`,
`/en/` carrega `docs/en/index.html` e o que não existe cai no `404.html`.

Para parar, `Ctrl+C`.

---

## Tarefas do dia a dia

### Conferir tudo antes de abrir o PR

```bash
node tools/conferir.js
```

 usado onde só `$`
funciona, a lista de `html[data-anim]` batendo com a do JavaScript, arquivo de
trabalho dentro de `docs/`, sitemap nos dois sentidos, link e caminho de imagem
quebrados, canonical apontando para a própria página, `hreflang` recíproco e card de
exemplo marcado.
Sai com erro e diz o arquivo. Cada checagem está lá porque o erro correspondente já
aconteceu neste repositório.

Ele não substitui abrir a página e olhar. Não mede desempenho, não vê layout e não
lê texto.

### Publicar um projeto na seção Projetos

A seção existe e hoje mostra um bloco só, dizendo que os casos estão sendo preparados.
**Não há card de exemplo dentro do HTML de propósito:** card escrito "Nome do projeto"
logo abaixo de "Oito sistemas entregues" prova o contrário do que a frase afirma, e
ausência de prova custa menos que prova negativa.

O molde do card, com o passo a passo e a especificação da imagem, está em
`tools/capas-de-projeto.md`. Em resumo:

1. Salve o print em `docs/assets/img/cases/`, proporção 16 por 10, até 300 KB, sem
   dado sensível de cliente na tela.
2. Copie o molde para dentro de `<div class="proj-grid">`, nas duas línguas.
3. Escreva um `alt` que descreva a tela. Quem usa leitor de tela depende dele.
4. Apague o bloco `.proj-vazio` quando o primeiro projeto real entrar.
5. Rode `node tools/conferir.js`.

### Mudar o número de WhatsApp

Ele aparece em vários pontos, espalhados por cinco arquivos:

- `docs/assets/js/site.js`, constante `WHATSAPP_NUMERO` e `CONTATO.whatsapp`
- `docs/index.html` e `docs/en/index.html`: os `href` dos links `data-wa`, o link
  `tel:` da seção de contato e o `telephone` do JSON-LD, duas vezes em cada página
- `docs/sobre.html` e `docs/privacidade.html`, nos `href` escritos direto no HTML
- `docs/llms.txt`

Não confie nesta lista: troque, rode `node tools/conferir.js` e ele aponta o que ficou
para trás. Ele normaliza formato, então `16 99705-2711` e `+5516997052711` contam como
o mesmo número.

Os links já vêm prontos no HTML de propósito, para funcionarem mesmo se o JavaScript
falhar. O JavaScript só ajusta a mensagem conforme o idioma.

### Mexer nas perguntas frequentes

Cada pergunta existe em dois lugares da mesma página: no HTML visível, dentro de
`<details>`, e no JSON-LD do cabeçalho, no bloco `FAQPage`. Marcação de FAQ sem o
texto correspondente na tela conta como spam para o Google, e manter as duas cópias
na mão sempre desanda.

Por isso o texto visível é a fonte da verdade e o JSON-LD sai dele:

```bash
node tools/sincronizar-faq.js              # escreve o JSON-LD a partir da tela
node tools/sincronizar-faq.js --conferir   # só compara, e mostra o que difere
```

Edite o `<details>`, rode o script, pronto. Nunca edite o `FAQPage` na mão: na próxima
sincronização a edição se perde.

O atributo `data-assunto` de cada `<details>` é o que a ferramenta de IA usa para achar
a resposta certa. Se criar uma pergunta nova, escolha um `data-assunto` e acrescente ao
`enum` da ferramenta `openseed_responder_duvida_comum`, em `docs/assets/js/site.js`.

### Gerar a imagem de compartilhamento e os ícones

Os templates são páginas HTML que você fotografa. `tools/serve.js` publica só
`docs/`, então sirva `tools/` à parte, numa porta qualquer:

```bash
npx --yes serve tools -l 8901
```

**Não abra por `file://`.** A fonte Outfit vem do Google Fonts e não carrega nesse
protocolo; a imagem sai com a fonte errada e ninguém percebe até estar no ar.

1. Abra <http://127.0.0.1:8901/og-image.html> e espere `document.fonts.ready`
   resolver, mais um segundo de folga.
2. Fotografe o elemento `#og` e salve em `docs/assets/img/og-image.png`. Repita com
   `#og-en` para `og-image-en.png`.
3. **Confira o tamanho: tem que dar exatamente 1200 por 630.** Se vier maior, alguém
   tirou o `box-sizing: border-box` do template e o padding virou tamanho.
4. Os ícones saem de `icons.html` do mesmo jeito, cada bloco com o nome do atributo
   `data-arquivo`, dentro de `docs/assets/img/icons/`.
5. O `favicon.svg` é desenhado à mão, não sai de template. O `favicon-32.png` é ele
   rasterizado: se mudar um, refaça o outro. O SVG precisa começar no caractere `<`,
   sem linha em branco antes, senão o Safari mostra um quadrado branco.

Depois de trocar a imagem, passe o link no
[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) e clique em
*Scrape Again*, senão o WhatsApp continua mostrando a imagem antiga por dias.

---

## Decisões que valem conhecer antes de mexer

### O celular é o padrão, a tela grande é a exceção

`site.css` é escrito na ordem celular primeiro. As regras de tela larga estão em
`@media (min-width: 721px)` e daí para cima. Se você acrescentar estilo fora de media
query, ele vale para o celular também. Isso é de propósito.

### Um botão de ação por tela

No celular a ação principal mora na barra fixa de baixo, na altura do polegar, e ela
some sozinha quando o botão grande da seção de contato aparece. Por isso o botão de
WhatsApp da barra de navegação e o do hero ficam escondidos abaixo de 721px: eram três
botões idênticos visíveis ao mesmo tempo.

### Nada depende de JavaScript para funcionar

Sem JavaScript o site continua legível e contatável: os links de WhatsApp estão no HTML,
o telefone e o e-mail aparecem em texto na seção de contato, e o FAQ abre e fecha porque
usa `<details>` nativo. O JavaScript adiciona movimento, o menu do celular e as
ferramentas de IA, e nada mais.

### Movimento é enfeite, nunca conteúdo

A entrada por rolagem e o fio do processo valem em qualquer tela. Ficam só no desktop
as coisas que dependem de mouse e não têm equivalente no toque: o leque de cards que
abre na rolagem, a inclinação 3D do card e o parallax do ponteiro.

**O estado sem animação tem que ser o estado visível.** São três caminhos que precisam
terminar com a página na tela: `prefers-reduced-motion`, GSAP que não carregou, e
JavaScript desligado. Teste os três antes de animar algo novo.

Para não haver piscar, os elementos da entrada nascem escondidos por CSS, na regra
`html[data-anim]`, marcada por um script no cabeçalho antes da primeira pintura. **A
lista de seletores dessa regra existe também em `site.js`, em `SEL_ENTRADA` e
`SEL_REVELA`**, e `node tools/conferir.js` reprova se as duas divergirem.

Nessa regra, só `opacity`, nunca `transform`: o GSAP lê o transform que vem do CSS
como deslocamento em pixels e soma o próprio por cima. Foi assim que o título do hero
terminou a entrada 47 pixels abaixo, cortado pela própria máscara.

### A cor tem conta feita

`--muted` dá 9,1:1 e `--faint` dá 4,9:1 contra o fundo `--bg`, os dois acima do mínimo
de 4,5:1 para texto pequeno. Clarear o fundo sem refazer a conta quebra a acessibilidade.

### Nenhum número inventado

O site diz oito projetos porque são oito. Não existe nota de avaliação no JSON-LD, nem
logo de cliente, nem depoimento fabricado. Marcar `aggregateRating` sem avaliação real
é motivo de punição do Google, além de ser mentira.

---

## O site para agentes de IA

A landing se apresenta como um conjunto de ferramentas para agentes que rodam dentro do
navegador, seguindo o rascunho de **WebMCP** do W3C Web Machine Learning Community
Group. Só funciona em HTTPS, e navegador sem suporte ignora o bloco: a página funciona
igual.

Três detalhes da especificação que o código segue e que mudam com frequência:

- **O objeto vive em `document.modelContext`.** Ele nasceu em `navigator` e migrou;
  `navigator.modelContext` ficou como apelido a caminho da remoção. O código procura
  nos dois, nessa ordem.
- **`execute` devolve blocos de conteúdo**, não objeto solto: `{ content: [{ type:
  "text", text: "..." }], structuredContent: {...} }`. Os dois campos carregam o mesmo
  dado. Devolver `{ servicos: [...] }` cru faz o agente não conseguir ler a resposta.
- **O registro recebe um `AbortSignal`**: `registerTool(t, { signal })`. O
  `unregisterTool` saiu do rascunho.

Cada ferramenta declara em `fonte` o seletor de onde tira a resposta, e só é registrada
se a página tiver aquele elemento. Nas páginas internas sobra só
`openseed_montar_contato`, que usa apenas constantes. O motivo: agente que acha a
ferramenta e recebe lista vazia entende "essa empresa não tem serviço", o que é pior do
que não achar a ferramenta.

São seis ferramentas, todas de leitura:

| Ferramenta | O que devolve |
| --- | --- |
| `openseed_listar_servicos` | Os três serviços, com descrição e condições |
| `openseed_explicar_processo` | As etapas de um projeto, com prazo de cada uma |
| `openseed_listar_tecnologias` | A stack usada |
| `openseed_listar_projetos` | Os projetos publicados, filtrando os cards de exemplo |
| `openseed_responder_duvida_comum` | Preço, prazo, código, atendimento e uso de IA |
| `openseed_montar_contato` | Canais de contato e um link de WhatsApp já escrito |

Três regras foram seguidas na hora de escrever isso, e vale mantê-las:

1. **Nada escreve.** O site não tem servidor. Uma ferramenta que fingisse enviar
   mensagem seria mentira para o agente e para a pessoa.
2. **A ferramenta de contato avisa que não enviou nada.** Ela devolve o link para o
   agente entregar à pessoa, e diz isso na própria resposta.
3. **Os dados saem do HTML da página**, não de uma cópia no JavaScript. Assim a
   resposta do agente nunca diverge do que está escrito na tela.

Além do WebMCP, a página traz dados estruturados em JSON-LD (`WebSite`,
`ProfessionalService`, `WebPage` e `FAQPage`) e há um `llms.txt` com o resumo do site.
Sobre o `llms.txt`, sem ilusão: o Google declarou publicamente que o ignora e nenhum
provedor grande se comprometeu a lê-lo. Ele fica porque custa quase nada manter. Quem
faz o trabalho de verdade é o JSON-LD.

---

## Segurança

O site não tem servidor, então não há banco para invadir nem sessão para roubar. O que
sobra de superfície são os arquivos que vêm de fora e o que a página conta a terceiros.

**Script de terceiro só com verificação de integridade.** As duas tags do GSAP carregam
com `integrity` e `crossorigin`. Se o cdnjs for comprometido e entregar outro arquivo,
o navegador recusa executar em vez de rodar código de estranho na página de quem nos
visita. Sem GSAP a página funciona igual, só sem movimento. **Ao trocar a versão do
GSAP, pegue o resumo novo:**

```bash
curl "https://api.cdnjs.com/libraries/gsap/3.12.5?fields=sri"
```

**Política de referência em `meta`.** O GitHub Pages não deixa mandar cabeçalho HTTP,
então `<meta name="referrer" content="strict-origin-when-cross-origin">` vai no
cabeçalho de cada página. Google Fonts e cdnjs recebem só a origem, nunca o caminho
completo da página que a pessoa está lendo.

**Não há Content-Security-Policy.** Uma CSP por `<meta>` cobriria parte do caso, mas o
site usa `<style>` inline em página interna e um script inline no cabeçalho da landing,
então uma CSP honesta precisaria de `unsafe-inline` e não protegeria de nada. Se um dia
o site sair do GitHub Pages para um servidor que mande cabeçalho, vale refazer a conta.

**`tools/` é inalcançável pela web** porque não está dentro de `docs/`. O servidor
local imita isso: devolve 403 para travessia de caminho, inclusive codificada em
percent, e 400 para escape quebrado, em vez de morrer.

**Nada de segredo no repositório.** O site é estático e público. Se um dia precisar de
chave de API, ela não pode viver aqui.

---

## Duas línguas

`docs/index.html` é o português e `docs/en/index.html` é o inglês. As duas compartilham
o mesmo CSS e o mesmo JavaScript; o idioma sai do atributo `lang` do `<html>`, e os
textos que o JavaScript gera ficam no dicionário `T`, no topo de `site.js`.

Ao mexer no conteúdo, mexa nas duas. As páginas se apontam por `hreflang`, e o
`sitemap.xml` declara o par com `x-default` no português.

O manifesto, o sobre e a privacidade existem só em português, e os links para eles a
partir da versão em inglês carregam `hreflang="pt-BR"`, que é a forma honesta de dizer
ao navegador e ao buscador que aquele destino muda de língua.

---

## Publicar

A branch `main` publica sozinha. O fluxo é branch, PR, revisão e merge:

```bash
git switch -c feat/minha-mudanca
# edite, confira em http://127.0.0.1:8899
git add -A && git commit -m "feat: o que mudou"
git push -u origin feat/minha-mudanca
gh pr create
```

Depois do merge, o GitHub Pages leva de um a dois minutos. Se o domínio parar de
responder ou o certificado expirar, `DOMINIO.md` tem o diagnóstico completo, incluindo
a armadilha da validação travada que já aconteceu uma vez.

---

## Antes de abrir um PR

```bash
node tools/conferir.js
```

Isso cobre sozinho: FAQ contra JSON-LD, sitemap, `hreflang`, canonical, caminho
quebrado, número de WhatsApp, contagem de projetos, card de exemplo marcado e arquivo
de trabalho dentro de `docs/`.

O que a máquina não vê, e continua com você:

- [ ] Abriu em 320, 390 e 1440 pixels de largura sem rolagem lateral
- [ ] Console do navegador sem erro
- [ ] Desligou o JavaScript e a página continua legível e contatável
- [ ] Ligou "reduzir movimento" no sistema e nada sumiu da tela
- [ ] Mexeu no conteúdo? Fez nos dois idiomas
- [ ] Nenhum número ou depoimento que não seja verdade
