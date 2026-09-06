# Capas dos projetos

Print de cada projeto que aparece na seção Projetos da página inicial.

Este arquivo mora em `tools/` de propósito: é nota de trabalho, e nada dentro de
`docs/` deixa de ir para o ar. As imagens em si vão para
`docs/assets/img/cases/`, porque essas o site precisa servir.

## Como publicar uma capa

São três passos, e nenhum é opcional:

1. Salve o arquivo em `docs/assets/img/cases/`, com o nome `01.png`, `02.png`,
   `03.png`, na mesma ordem dos cards da página.
2. Abra `docs/index.html`, ache o card correspondente e tire a linha `<img ...>`
   de dentro do comentário. As tags nascem comentadas para o site não pedir um
   arquivo que ainda não existe.
3. Repita em `docs/en/index.html`, com o `alt` em inglês.

Ao descomentar, troque o texto do `alt`, que descreve a tela para quem usa leitor
de tela. Algo como `alt="Painel de pedidos do sistema, com a lista do dia"`.
Descreva o que a tela mostra, não o fato de ser uma imagem.

## Quando o card deixa de ser molde

Cada card de exemplo carrega o atributo `data-exemplo` no `<article>`. É por ele
que a ferramenta `openseed_listar_projetos` sabe que aquilo não é projeto
entregue, e não o devolve para um agente de IA como se fosse.

**Ao preencher um card com projeto real, apague o `data-exemplo`.** Enquanto o
atributo estiver lá, o projeto não aparece para agente nenhum. Trocar só o `<h3>`
não basta.

## Especificação da imagem

- Proporção 16 por 10, por exemplo 1280 por 800. O card recorta o excesso.
- Até 300 KB por imagem. PNG para tela de sistema, JPG para foto.
- Sem dado sensível de cliente na tela: nome real, documento, valor, telefone.

Enquanto a linha continuar comentada, o card mostra a capa tipográfica com a
inicial. Se você descomentar e o arquivo não existir, aí sim aparece o ícone de
imagem quebrada, então os passos andam juntos.
