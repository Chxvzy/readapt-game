# Readapt: Dyslexi-Trouble — instruções para o Claude Code

Você é o desenvolvedor principal deste jogo. Quem pede é o Felipe, que NÃO escreve o código: ele abre o jogo, joga e aponta os defeitos. Você escreve, corrige e organiza tudo.

Prazo final: segunda-feira, 19/10/2026. O objetivo é entregar um jogo COMPLETO e jogável, com todas as fases, e não só um protótipo.

## Documentos de referência (nesta pasta, em /docs)

- `docs/GDD.md`: documento de design original. É a fonte da verdade sobre história, personagens, cenários e finais.
- `docs/briefing.md`: situação, escopo e plano.
- `docs/jogabilidade.md`: regras de jogo no estilo The Binding of Isaac.
- `docs/arte-som-acessibilidade.md`: visual, lista de assets e acessibilidade.

Leia todos antes de começar. Se algum documento contradisser este arquivo, este arquivo vence.

## O jogo em uma frase

Jogo educativo top-down de aventura, puzzle e ação leve para crianças com dislexia: o robô Readapt entra no "Mundo da Dislexia", derrota criaturas feitas de letras e palavras distorcidas, resolve atividades de leitura e salva a criança. Estrutura de salas, portas que trancam, tiros em 4 direções, itens e salas secretas como em The Binding of Isaac; tom e múltiplos finais como em Undertale.

## Escopo: TODAS as fases

Construa os 3 cenários do GDD, nesta ordem de prioridade. Cada um deve ficar jogável antes de passar ao próximo.

1. **Mundo das Letras**: tutorial e primeiras salas, inimigos básicos, primeira atividade, sala secreta com upgrade.
2. **Labirinto das Palavras**: mais salas, inimigos mais fortes, atividades de palavras e sílabas, mais um upgrade.
3. **Núcleo da Dislexia**: salas escuras e o chefe final (a entidade da Dislexia), com fases de luta.

Também faça: tela inicial, HUD com vida e upgrades, tela de vitória e de derrota, e os 3 finais (ruim, normal, verdadeiro).

Se o tempo apertar, corte nesta ordem: sons e música, salas extras, criaturas amigáveis. Nunca corte: movimento, ataque, portas, atividades, chefe e as telas de fim.

## Tecnologia

- HTML5 + JavaScript com **Phaser 3 carregado por CDN**. Sem npm, sem bundler, sem instalar nada.
- O jogo abre com a extensão Live Server do VS Code (`index.html`).
- Estrutura de arquivos sugerida:

```
index.html
src/
  main.js            configuração do Phaser
  scenes/            Boot, Menu, Game, Boss, End
  data/              salas, inimigos, palavras e atividades (dados, não código)
  systems/           vida, atividades, portas, upgrades
  art/               funções que desenham os sprites por código
assets/              imagens e sons reais, quando o Felipe adicionar
```

- Mantenha o conteúdo (salas, palavras, atividades, falas) em arquivos de **dados**, para o Felipe conseguir editar sem mexer na lógica.

## Arte: trocável depois

O Felipe fará as artes depois. Por isso:

- Desenhe tudo agora em **pixel art gerada por código** (texturas criadas com gráficos do Phaser), em grade de 16x16 ou 32x32.
- Centralize os sprites em um único lugar, com um nome de textura para cada personagem, inimigo, item e cenário (ex.: `readapt`, `letra_torta`, `chefe_dislexia`, `piso_letras`).
- Faça o carregamento assim: se existir um arquivo em `assets/` com o mesmo nome da textura, usa o arquivo; senão, usa o sprite gerado por código. Assim ele troca a arte sem tocar na lógica.
- Mantenha o alto contraste entre jogador, inimigos e fundo.
- Mantenha `assets/LEIAME.md` atualizado com a lista de todas as texturas, tamanho esperado e onde cada uma é usada.

## Acessibilidade (obrigatório)

- Fonte legível e grande (Lexend ou OpenDyslexic quando disponível, com fallback sem serifa).
- Sem texto piscando e sem flashes fortes.
- Sem cronômetro apertado nas atividades; o erro ensina em vez de punir demais.
- Feedback curto, positivo e claro.
- Cuidado com letras parecidas (b/d, p/q): sempre em contexto claro.

## Como trabalhar

1. Trabalhe em **etapas pequenas** e termine cada uma com o jogo funcionando. Nunca deixe o jogo quebrado entre etapas.
2. Depois de cada etapa, rode uma checagem simples (o código carrega sem erros) e diga ao Felipe em 3 linhas: o que foi feito, como testar e qual é o próximo passo.
3. Quando o Felipe apontar um defeito, corrija e explique em uma frase o que estava errado.
4. Se algo do GDD for grande demais para o prazo, avise e proponha uma versão reduzida.
5. Explique de forma simples e curta, em português. O Felipe tem pouca experiência com jogos.
6. Faça um commit do Git ao fim de cada etapa que funcionar, se o Git estiver disponível; senão, avise o Felipe para copiar a pasta como backup.
7. Não invente conteúdo educativo fora do escopo: palavras e atividades devem ser adequadas a crianças em fase de alfabetização, simples e claras.

## Definição de pronto

Uma pessoa abre o jogo, passa pelos 3 cenários, enfrenta o chefe e chega a uma tela de final (vitória ou derrota) sem erros, com o resultado dependendo do que ela fez.
