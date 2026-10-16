# Readapt: Dyslexi-Trouble — Especificação de jogabilidade (estilo Binding of Isaac)

Traduz o GDD para regras concretas de jogo, no estilo The Binding of Isaac, adaptadas ao tema educativo. Tudo aqui é uma proposta inicial e pode ser ajustado.

## Controles

- **Mover**: WASD
- **Atacar**: setas, nas 4 direções
- **Interagir / confirmar atividade**: E ou Enter
- **Pausar**: Esc
- Botões na tela para celular ficam como melhoria futura

## Estrutura das salas (como no Isaac)

- O mapa é feito de salas ligadas por portas nas quatro bordas.
- Ao entrar numa sala com inimigos, as **portas trancam** até o jogador limpar a sala ou resolver a atividade.
- Salas especiais: tutorial, desafio educativo, sala secreta, sala do chefe.
- Mapa **fixo** (definido em arquivos de dados). Geração procedural fica para depois.
- Cada um dos 3 cenários tem várias salas, uma sala secreta opcional e uma passagem para o próximo.

| Cenário | Clima | Função |
|---|---|---|
| Mundo das Letras | Colorido, letras flutuando | Tutorial, primeiras atividades, sala secreta com upgrade |
| Labirinto das Palavras | Confuso, corredores tortos | Mais salas e inimigos, atividades mais difíceis, mais um upgrade |
| Núcleo da Dislexia | Escuro e instável | Salas finais e luta contra o chefe |

## Ataque e a mecânica educativa

No Isaac as lágrimas são o tiro. Aqui o tiro do Readapt é um **pulso de restauração** que corrige letras distorcidas.

- Atacar inimigos tira vida deles e os "restaura" (viram letras normais e somem).
- **Atividades educativas** liberam portas e caminhos, conforme o GDD. Exemplos:
  - **Palavra embaralhada**: as letras aparecem soltas na sala; o jogador as atinge ou coleta na ordem certa para formar a palavra.
  - **Sílaba que falta**: aparece uma figura ou palavra incompleta e o jogador escolhe a sílaba certa entre 3 opções.
- Acertar enfraquece os monstros; errar tira vida ou atrasa o progresso temporariamente.
- Sem pressão de tempo apertada nas atividades, para não aumentar a ansiedade de quem lê com dificuldade.
- Palavras e sílabas ficam em arquivos de dados, simples e adequadas a crianças em fase de alfabetização.

## Vida e HUD

- Vida em **corações**, visível no canto superior esquerdo.
- Vida inicial: 5 corações.
- Mostrar também o nome do cenário/sala atual e um ícone para cada upgrade coletado.
- Dano ao jogador: contato com inimigo ou erro numa atividade, com um breve período de invulnerabilidade.

## Inimigos

| Inimigo | Comportamento | Base no GDD |
|---|---|---|
| **Letra Torta** | Persegue o jogador devagar | Letras distorcidas |
| **Sílaba Quebrada** | Ao ser derrotada, se divide em duas sílabas menores | Sílabas quebradas |
| **Palavra Embaralhada** | Fica parada e dispara letras em direção ao jogador | Palavras embaralhadas |
| **Criatura da Confusão** | Muda de posição de forma imprevisível | Criaturas da confusão |

## Chefe: a entidade da Dislexia

- Criatura grande formada por letras embaralhadas, na sala final do Núcleo da Dislexia.
- Ela **não morre só com tiro**: ataca com ondas de letras, e o jogador precisa resolver desafios de leitura para deixá-la vulnerável.
- Fases: (1) ataques básicos, (2) invoca letras tortas, (3) fase final mais rápida.
- A cada acerto nos desafios, a barra de vida dela diminui.

## Itens e upgrades

Upgrades vindos de salas secretas ou de criaturas amigáveis (fragmentos de memória da criança):

- Ataque tecnológico mais forte
- Mais resistência (coração extra)
- Escaneamento: destaca a letra correta por um instante (dica educativa)

## Escolhas e consequências

- Explorar salas secretas e fazer atividades extras libera upgrades e recompensas.
- Ignorar desafios deixa a luta final mais difícil.
- Errar atividades diminui vida ou atrasa o progresso.

## Finais

| Final | Condição |
|---|---|
| **Ruim** | O jogador perde toda a vida; a criança continua presa no mundo da Dislexia |
| **Normal** | Derrota o chefe; Readapt salva a criança |
| **Verdadeiro** | Completa todas as atividades, acha as salas secretas e restaura totalmente o mundo |

## Telas do jogo

- Tela inicial com o nome e botão de jogar
- Jogo (salas, HUD)
- Vitória e derrota, com a opção de jogar de novo
