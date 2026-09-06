# Capas dos projetos

Print de cada projeto que aparece na seção Projetos de `desenvolvimento.html`.

## Como publicar uma capa

São dois passos, e o segundo é obrigatório:

1. Salve o arquivo aqui como `01.png`, `02.png`, `03.png`, na mesma ordem dos
   cards da página.
2. Abra `desenvolvimento.html`, ache o card correspondente e tire a linha
   `<img ...>` de dentro do comentário. Sem isso a imagem não aparece, porque
   as tags nascem comentadas para o site não pedir um arquivo que ainda não existe.

Ao descomentar, troque também o texto `alt`, que descreve a tela para quem usa
leitor de tela. Algo como `alt="Painel de pedidos do sistema, com a lista do dia"`.

## Especificação

- Proporção 16 por 10, por exemplo 1280 por 800. O card recorta o excesso.
- Até 300 KB por imagem. PNG para tela de sistema, JPG para foto.
- Sem dado sensível de cliente na tela: nome real, documento, valor, telefone.

Enquanto a linha continuar comentada, o card mostra a capa tipográfica com a
inicial. Se você descomentar e o arquivo não existir, aí sim aparece o ícone de
imagem quebrada, então os dois passos andam juntos.
