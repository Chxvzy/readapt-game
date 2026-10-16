# Readapt: Dyslexi-Trouble — Briefing do projeto

Explica a situação, o prazo, o escopo e como o Claude deve trabalhar comigo.

## Situação

- Eu sou o Felipe, de São Paulo. Tenho experiência com desenvolvimento web (HTML, JavaScript, Node.js), mas pouca experiência com jogos.
- Tenho conta Claude Pro e uso o Claude Code no VS Code como parceiro de desenvolvimento.
- O jogo **Readapt: Dyslexi-Trouble** precisa estar pronto na **segunda-feira, 19/10/2026**. Hoje é quinta, 15/10/2026, então restam 4 dias.
- O documento de design completo (`GDD.md`) é a fonte da verdade sobre história, personagens, cenários e finais.
- Eu não escrevo o código: abro o jogo, jogo e aponto os defeitos. O Claude escreve e corrige.
- Suposição de trabalho: na segunda preciso **apresentar o jogo jogável** (funcionando no navegador).

## O que é o jogo, em resumo

Jogo educativo de aventura, visão de cima (top-down), com puzzle e ação leve, para crianças com dislexia. O robô Readapt entra no "Mundo da Dislexia", derrota criaturas feitas de letras e palavras distorcidas e restaura a leitura de uma criança.

Inspirações: **The Binding of Isaac** (principal, na estrutura de salas, portas, tiros, itens e salas secretas), **Undertale** (tom, escolhas e múltiplos finais) e **Mario** (clareza e progressão simples).

## Escopo para segunda-feira

A meta é entregar **todos os 3 cenários** do GDD, jogáveis do começo ao fim. Se o tempo apertar, corta-se nesta ordem: sons e música, salas extras, criaturas amigáveis.

### Obrigatório (nunca cortar)

- Robô Readapt com movimento e ataque em 4 direções
- Salas ligadas por portas que trancam até limpar a sala ou resolver a atividade
- Os 3 cenários: Mundo das Letras, Labirinto das Palavras e Núcleo da Dislexia
- Inimigos formados por letras e sílabas
- Atividades educativas que liberam as portas (ex.: montar a palavra certa)
- Sistema de vida (HUD) e erro nas atividades que tira vida
- Upgrades encontráveis, incluindo salas secretas
- Chefe final: a entidade da Dislexia, que enfraquece a cada acerto
- Tela inicial, tela de vitória e tela de derrota
- Os 3 finais (ruim, normal e verdadeiro)

### Se sobrar tempo

- Mais salas e mais upgrades
- Sons e música
- Pequenos robôs auxiliares e criaturas amigáveis

### Fica para depois da apresentação

- Geração procedural de salas, salvamento de progresso e integração com o site/app do Readapt

## Tecnologia

- **HTML5 + JavaScript** com **Phaser 3** por CDN, rodando no navegador (Live Server no VS Code).
- Arte em **pixel art gerada por código**, trocável depois por imagens que eu mesmo farei.
- Publicação no **Vercel** no domingo, para abrir o jogo por link.

## Como o Claude deve trabalhar comigo

- Trabalhar em etapas pequenas, com o jogo funcionando no fim de cada uma.
- Depois de cada entrega, dizer em 3 linhas: o que foi feito, como testar e qual o próximo passo.
- Explicar de forma simples e curta, em português.
- Avisar quando algo do GDD for grande demais para o prazo e propor uma versão reduzida.
- Se eu colar um erro do console, corrigir direto nos arquivos.

## Plano de 4 dias

| Dia | Meta |
|---|---|
| Quinta (15/10) | Base jogável: robô, ataque e primeira sala com inimigos |
| Sexta (16/10) | Salas, portas, vida, atividades educativas, inimigos e upgrades |
| Sábado (17/10) | Labirinto das Palavras, Núcleo da Dislexia e chefe |
| Domingo (18/10) | Finais, polimento, testes e publicação no Vercel |
| Segunda (19/10) | Apresentação |

## Definição de pronto

O jogo está pronto quando uma pessoa consegue abrir o link, passar pelos 3 cenários, enfrentar o chefe e chegar a uma tela de vitória ou de derrota sem erros.
