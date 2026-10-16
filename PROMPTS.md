# Prompts para colar no Claude Code (em ordem)

Cole um por vez. Só passe para o próximo quando o atual estiver funcionando.
Depois de cada etapa: abra o jogo com o Live Server, jogue e me diga o que está errado em frases simples (ex.: "a porta não abre", "o inimigo é rápido demais").

---

## Etapa 0 — Leitura e plano (cole primeiro)

```
Leia o CLAUDE.md e todos os arquivos da pasta docs. Depois me responda em português simples: (1) o que você entendeu do jogo, (2) um plano em etapas para entregar todos os 3 cenários até segunda-feira, e (3) qualquer dúvida importante. Não escreva código ainda.
```

## Etapa 1 — Base jogável

```
Crie a base do jogo: index.html, src/main.js e as cenas Boot, Menu e Game, com Phaser 3 por CDN, na estrutura do CLAUDE.md. Inclua o Readapt em pixel art por código, movimento com WASD, ataque nas setas em 4 direções, e uma primeira sala do cenário Mundo das Letras com paredes, piso e 3 inimigos-letra que perseguem o jogador. Inclua tela inicial com botão de jogar. Termine me dizendo como abrir e testar.
```

## Etapa 2 — Salas, portas e vida

```
Adicione o sistema de salas ligadas por portas, como no Binding of Isaac: as portas trancam quando há inimigos e abrem ao limpar a sala. Adicione vida em corações (5 no início), HUD, dano ao tocar em inimigos e um pequeno tempo de invulnerabilidade. Crie as salas do Mundo das Letras definidas em arquivos de dados.
```

## Etapa 3 — Atividades educativas

```
Crie o sistema de atividades educativas que liberam portas: (a) palavra embaralhada, em que o jogador organiza as letras na ordem certa, e (b) sílaba que falta, com 3 opções. Os conteúdos (palavras, sílabas, opções) devem ficar em arquivos de dados fáceis de editar. Acertar enfraquece os inimigos e errar tira vida ou atrasa o progresso. Sem cronômetro apertado e com feedback curto e positivo.
```

## Etapa 4 — Inimigos e upgrades

```
Crie os 4 tipos de inimigos do documento de jogabilidade: Letra Torta, Sílaba Quebrada (divide em duas ao ser derrotada), Palavra Embaralhada (dispara letras) e Criatura da Confusão. Adicione a sala secreta do Mundo das Letras com um upgrade, e o sistema de upgrades (ataque mais forte, coração extra e escaneamento que destaca a letra certa).
```

## Etapa 5 — Labirinto das Palavras

```
Crie o cenário Labirinto das Palavras: novo visual (cores do guia de arte), mais salas, mais inimigos, atividades de palavras e sílabas mais difíceis, passagem do cenário 1 para o 2 e mais um upgrade. Mantenha o jogo funcionando do começo ao fim.
```

## Etapa 6 — Núcleo da Dislexia e chefe

```
Crie o cenário Núcleo da Dislexia (escuro, instável) e a luta contra a entidade da Dislexia: criatura grande de letras embaralhadas, com 3 fases. Ela não morre só com tiros: o jogador precisa resolver desafios de leitura para deixá-la vulnerável, e cada acerto reduz a vida dela. Adicione a barra de vida do chefe.
```

## Etapa 7 — Finais e telas

```
Crie as telas de fim e os 3 finais: ruim (perdeu toda a vida), normal (derrotou o chefe) e verdadeiro (completou todas as atividades e achou as salas secretas). Adicione a opção de jogar de novo e o texto final de cada um, curto e adequado a crianças.
```

## Etapa 8 — Polimento

```
Faça um polimento geral: revise a acessibilidade (fontes, contraste, sem flashes), a dificuldade (nenhuma sala deve ser injusta), erros no console e a transição entre cenários. Se houver tempo, adicione efeitos sonoros simples gerados por código e um botão para ligar e desligar o som. Atualize o assets/LEIAME.md com a lista de todas as artes a trocar.
```

## Etapa 9 — Publicar no Vercel

```
Prepare o jogo para publicar no Vercel como site estático e me explique, passo a passo e em português simples, como colocar no ar e pegar o link.
```

---

## Frases úteis durante o teste

- "Isso está errado: [o que aconteceu]. O que eu esperava era [o que deveria acontecer]."
- "Apareceu este erro no console: [cole o erro aqui]."
- "Está muito difícil / fácil: [sala ou inimigo]."
- "Antes de continuar, faça uma cópia de segurança do que funciona."

## Quando as artes estiverem prontas

```
Coloquei as imagens na pasta assets com os nomes do assets/LEIAME.md. Faça o jogo usar essas imagens no lugar dos sprites gerados por código e ajuste os tamanhos e as colisões se precisar.
```
