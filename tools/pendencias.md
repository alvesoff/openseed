# O que falta, e que só o dono do negócio pode preencher

Este arquivo mora em `tools/` de propósito: é nota de trabalho e não vai para o ar.
Nenhuma destas pendências pode ficar escrita dentro de `docs/`. Aviso de pendência
publicado em `view-source` é pior que a pendência.

---

## 1. Razão social e CNPJ, para a política de privacidade

**Onde entra:** `docs/privacidade.html`, seção "Quem é o responsável".

Hoje a página diz apenas "A OpenSeed é a responsável pelo tratamento dos dados
descritos aqui", com e-mail e WhatsApp funcionando. A LGPD (Lei nº 13.709/2018) pede
que o controlador dos dados esteja identificado, e razão social mais CNPJ é a forma
usual de fazer isso.

Quando tiver os dados, a frase vira:

> A **[Razão Social], CNPJ [00.000.000/0001-00]**, que atende pelo nome OpenSeed, é a
> responsável pelo tratamento dos dados descritos aqui.

Trocar também a data no topo da página, que precisa refletir a última alteração real.

## 2. Faixa de preço

**Onde entra:** dois pontos, e é a mudança de maior retorno que a página ainda não tem.

A pesquisa é consistente: preço transparente aparece em primeiro lugar entre 28 tipos
de informação que compradores procuram, e o único teste A/B publicado sobre "a partir
de" mediu 15% de ganho. Hoje a página não diz nenhum número em reais.

Nada de inventar valor nem deixar "R$ X" no texto. Quando o número existir:

1. `docs/index.html` e `docs/en/index.html`, primeira frase da resposta do FAQ de preço:
   *"MVP a partir de R$ [número], em 4 a 8 semanas. Você conta o problema e a gente
   devolve em até 3 dias úteis o escopo, o prazo e o preço fechados."*
   Depois rodar `node tools/sincronizar-faq.js` para o JSON-LD acompanhar.
2. `docs/index.html` e `docs/en/index.html`, primeira `<li>` das `.garantias` do hero:
   *"MVP a partir de R$ [número], com escopo fechado antes de começar"*.
3. No JSON-LD dos dois idiomas, trocar `"priceRange": "$$"` pelo valor real.

Faixa fechada ("de R$ X a R$ Y") resolve igual, se valor absoluto não servir.

## 3. Janela de resposta

**Onde entra:** quatro lugares.

Hoje o site promete "Resposta no mesmo dia útil", que é o fato confirmado. A pesquisa
mostra que janela curta com horário declarado ("respondo em até 1 hora, das 9h às 18h")
vale mais. **Só trocar se for verdade e se der para cumprir sempre.** Promessa de
resposta descumprida custa mais que promessa modesta.

Se mudar, trocar nos quatro: a linha fina do bloco de contato nas duas landings, a
`meta name="description"` do cabeçalho, e `T.mcp.resposta` em `docs/assets/js/site.js`,
nos dois idiomas.

## 4. Projetos de verdade

**Onde entra:** `docs/index.html` e `docs/en/index.html`, seção `#projetos`.

Hoje a seção mostra um bloco só, dizendo que os casos estão sendo preparados. Não há
card de exemplo ali de propósito: card escrito "Nome do projeto" é molde, e molde
publicado desmente o título da seção.

Para cada projeto que puder ser publicado, o passo a passo está em
`tools/capas-de-projeto.md`. O que precisa de você, por projeto:

- nome ou apelido do sistema (pode ser genérico, se o contrato exigir)
- segmento do cliente e ano
- uma frase sobre o problema que ele resolveu, de preferência com número
- as tecnologias usadas
- um print da tela, sem dado sensível

Cliente que não autoriza o nome ainda dá caso: "Distribuidora de autopeças, 2026,
pedido e estoque num sistema só" vende sem identificar ninguém.

## 5. LICENSE do repositório

O repositório é público e o site vende a política de propriedade do código como
diferencial no FAQ. Sem arquivo `LICENSE`, o padrão legal é "todos os direitos
reservados", o que por acaso é o que o FAQ diz. Ou seja: hoje funciona, mas por
omissão. Declarar explicitamente evita ambiguidade.
