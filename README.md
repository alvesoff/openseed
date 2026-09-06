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
├── docs/                    ← isto, e só isto, vai para o ar
│   ├── index.html           landing em português (página inicial)
│   ├── en/index.html        a mesma página em inglês
│   ├── manifesto.html       manifesto da marca, com o gráfico de conteúdo sintético
│   ├── sobre.html           quem é a OpenSeed e o modelo de trabalho
│   ├── privacidade.html     política de privacidade
│   ├── 404.html             página de erro
│   ├── assets/
│   │   ├── css/site.css     estilo das duas landings
│   │   ├── js/site.js       comportamento das duas landings
│   │   ├── brand/           arquivos originais da marca
│   │   └── img/
│   │       ├── og-image.png imagem de compartilhamento (1200x630)
│   │       ├── cases/       prints dos projetos, ver LEIA-ME.md de lá
│   │       └── icons/       favicon (SVG e PNG) e ícones de aplicativo
│   ├── CNAME                domínio do GitHub Pages, não apagar
│   ├── robots.txt           regras de rastreamento, inclui os robôs de IA
│   ├── sitemap.xml          mapa do site com as duas línguas
│   ├── llms.txt             resumo do site em texto, para ferramentas de IA
│   └── site.webmanifest     nome e ícones ao salvar na tela inicial
│
├── tools/                   ← ferramentas de trabalho, fora do ar
│   ├── serve.js             servidor local que imita o GitHub Pages
│   ├── og-image.html        template da imagem de compartilhamento
│   └── icons.html           template dos ícones
│
├── DOMINIO.md               como o domínio está configurado no Registro.br
└── README.md                este arquivo
```

**Por que `docs/` existe.** Antes, o repositório inteiro ia para o ar, e isso incluía
templates que não são páginas do site (`og-image.html`, os arquivos de marca).
Qualquer pessoa conseguia abrir esses HTML soltos no domínio. Agora só `docs/` é
publicado, e o que é ferramenta fica em `tools/`, inalcançável pela web.

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

### Publicar um projeto na seção Projetos

1. Salve o print em `docs/assets/img/cases/`, com o nome `01.png`, `02.png`, na mesma
   ordem dos cards. Proporção 16 por 10, até 300 KB, sem dado sensível de cliente na tela.
2. Em `docs/index.html`, ache o card e tire a linha `<img ...>` de dentro do comentário.
3. Troque o texto do `alt` para descrever a tela: quem usa leitor de tela depende dele.
4. Preencha `<h3>`, a frase do problema e a linha de meta (segmento, ano, tecnologias).
5. Repita em `docs/en/index.html`, em inglês.
6. Quando a grade encher, remova o bloco `.proj-vazio`.

Detalhes em `docs/assets/img/cases/LEIA-ME.md`.

### Mudar o número de WhatsApp

Ele aparece em quatro lugares. Trocar nos quatro:

- `docs/assets/js/site.js`, constante `WHATSAPP_NUMERO`
- `docs/index.html` e `docs/en/index.html`, nos `href` dos links `data-wa` e no `telephone` do JSON-LD
- `docs/llms.txt`
- `docs/sobre.html`, constante `WHATSAPP`

Os links já vêm prontos no HTML de propósito, para funcionarem mesmo se o JavaScript
falhar. O JavaScript só ajusta a mensagem conforme o idioma.

### Mexer nas perguntas frequentes

Cada pergunta existe em dois lugares da mesma página: no HTML visível, dentro de
`<details>`, e no JSON-LD do cabeçalho, no bloco `FAQPage`. **Mexeu em um, mexa no
outro.** Marcação de FAQ sem o texto correspondente na tela conta como spam para o Google.

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

As animações só rodam em tela larga com mouse, e apenas quando
`prefers-reduced-motion` não pede o contrário. No celular a página já nasce visível.
Se você animar algo novo, garanta que o estado sem animação seja o estado visível,
senão quem pediu menos movimento vê a página em branco.

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
navegador, seguindo o rascunho de **WebMCP** do W3C Web Machine Learning Community Group
(`navigator.modelContext`, Chrome 146 em diante, só em HTTPS). Navegador sem suporte
ignora o bloco e a página funciona igual.

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

- [ ] Abriu em 320, 390 e 1440 pixels de largura sem rolagem lateral
- [ ] Console do navegador sem erro
- [ ] Mexeu no FAQ visível? Mexeu no JSON-LD também
- [ ] Mexeu no conteúdo? Fez nos dois idiomas
- [ ] Página nova? Entrou no `sitemap.xml`
- [ ] Nenhum número ou depoimento que não seja verdade
- [ ] Nenhum arquivo de trabalho dentro de `docs/`
