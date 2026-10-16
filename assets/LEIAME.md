# Artes do jogo (assets)

Todos os desenhos do jogo são feitos por código. Para trocar um deles por uma imagem sua:

1. Faça a imagem em **.png** com fundo transparente.
2. Salve nesta pasta (`assets/`) com o **nome exato da textura** (tabela abaixo). Exemplo: `assets/readapt.png`.
3. Abra `assets/artes.js` e coloque o nome na lista. Exemplo: `window.ARTES_PRONTAS = ['readapt'];`
4. Recarregue o jogo.

A imagem é ajustada automaticamente para o tamanho da tabela. Para ficar nítida, desenhe no tamanho da tabela ou num tamanho proporcional (por exemplo, 16x16 para um sprite de 48x48).

Se o nome estiver errado, o jogo avisa no console e continua usando o desenho feito por código.

| Nome da textura | Tamanho no jogo (px) | Onde é usada |
|---|---|---|
| `readapt` | 48 x 56 | Jogador olhando para baixo (frente) |
| `readapt_costas` | 48 x 56 | Jogador olhando para cima (costas) |
| `readapt_direita` | 48 x 56 | Jogador olhando para a direita |
| `readapt_esquerda` | 48 x 56 | Jogador olhando para a esquerda |
| `letra_torta` | 48 x 48 | Inimigo Letra Torta |
| `silaba_quebrada` | 48 x 48 | Inimigo Sílaba Quebrada |
| `silaba_pedaco` | 30 x 30 | Pedaço da Sílaba Quebrada |
| `palavra_embaralhada` | 48 x 48 | Inimigo Palavra Embaralhada (fica parado e atira) |
| `criatura_confusao` | 48 x 48 | Inimigo Criatura da Confusão (muda de lugar) |
| `chefe_dislexia` | 168 x 168 | Chefe final: a Dislexia (montanha de letras) |
| `npc_bip` | 48 x 48 | Bip, o robô ajudante (primeira sala) |
| `fragmento_memoria` | 48 x 48 | Fragmento de memória (criatura amigável) |
| `crianca` | 48 x 48 | A criança (telas de final) |
| `coracao_cheio` | 36 x 32 | Coração cheio (HUD) |
| `coracao_meio` | 36 x 32 | Meio coração (HUD e item que cura) |
| `coracao_vazio` | 36 x 32 | Coração vazio (HUD) |
| `up_pulso` | 48 x 48 | Upgrade Pulso Forte |
| `up_coracao` | 48 x 48 | Upgrade Coração Extra |
| `up_scan` | 48 x 48 | Upgrade Escaneamento |
| `pulso` | 22 x 22 | Tiro do Readapt (gota de energia) |
| `letra_tiro` | 26 x 26 | Tiro dos inimigos (uma letra) |
| `bloco_letra` | 64 x 64 | Bloco de letra das atividades |
| `bloco_silaba` | 120 x 64 | Bloco de sílaba das atividades |
| `livro` | 48 x 48 | Livro brilhante da luta contra o chefe |
| `portal` | 96 x 96 | Portal para o próximo cenário |
| `porta_aberta` | 96 x 48 | Porta aberta |
| `porta_trancada` | 96 x 48 | Porta trancada |
| `piso_letras` | 48 x 48 | Piso do cenário letras (repete pela sala) |
| `parede_letras` | 48 x 48 | Parede do cenário letras |
| `bloco_letras` | 48 x 48 | Pedra (obstáculo) do cenário letras |
| `rachada_letras` | 96 x 48 | Parede rachada (esconde sala secreta) do cenário letras |
| `piso_labirinto` | 48 x 48 | Piso do cenário labirinto (repete pela sala) |
| `parede_labirinto` | 48 x 48 | Parede do cenário labirinto |
| `bloco_labirinto` | 48 x 48 | Pedra (obstáculo) do cenário labirinto |
| `rachada_labirinto` | 96 x 48 | Parede rachada (esconde sala secreta) do cenário labirinto |
| `piso_nucleo` | 48 x 48 | Piso do cenário nucleo (repete pela sala) |
| `parede_nucleo` | 48 x 48 | Parede do cenário nucleo |
| `bloco_nucleo` | 48 x 48 | Pedra (obstáculo) do cenário nucleo |
| `rachada_nucleo` | 96 x 48 | Parede rachada (esconde sala secreta) do cenário nucleo |
| `papel` | 440 x 330 | Papel do menu principal |

## Observações

- As 4 imagens do Readapt (`readapt`, `readapt_costas`, `readapt_direita`, `readapt_esquerda`) já estão prontas nesta pasta. O robô vira para onde anda e para onde atira.
- A animação de andar fica em 4 folhas: `readapt_andar_frente.png`, `readapt_andar_costas.png`, `readapt_andar_direita.png` e `readapt_andar_esquerda.png`. Cada folha tem **6 quadros lado a lado de 48 x 56** (288 x 56 no total). Essas folhas são carregadas sozinhas, não precisa colocar no `artes.js`.
- A animação de atirar fica em `readapt_atirar_frente.png`, `readapt_atirar_costas.png`, `readapt_atirar_direita.png` e `readapt_atirar_esquerda.png`: **3 quadros de 48 x 56** (144 x 56 no total).

- As portas são desenhadas para a porta **de cima**. O jogo gira a imagem para as portas de baixo, da esquerda e da direita.
- O piso é repetido como azulejo pela sala inteira. Faça uma imagem que combine nas bordas.
- Mantenha alto contraste: o Readapt, os inimigos e o fundo devem ser fáceis de diferenciar.
- A escuridão do Núcleo, as sombras, os respingos, as manchas de tinta e os detalhes do chão são efeitos e não podem ser trocados por imagem.
- O estilo é escuro, de porão (como no The Binding of Isaac): use cores fechadas no cenário e cores vivas nos personagens.
