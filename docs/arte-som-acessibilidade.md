# Readapt: Dyslexi-Trouble — Guia de arte, som e acessibilidade

Define o visual, a lista de assets e as regras de acessibilidade para um jogo feito para crianças com dislexia.

## Estilo visual

- **Pixel art top-down**, no clima de Binding of Isaac e Undertale.
- Sprites em grade de **16x16 ou 32x32 pixels**, desenhados por código no início (sem arquivos de imagem).
- Cada sprite tem um nome de textura fixo, para o Felipe trocar depois por imagens próprias na pasta `assets/` sem mexer na lógica.
- Personagens com formas simples e silhuetas bem diferentes entre si, para a criança distinguir rápido o que é inimigo, item ou porta.

## Paleta e cenários

| Cenário | Clima | Cores sugeridas |
|---|---|---|
| Mundo das Letras | Colorido, letras flutuando | Azul-claro, amarelo, branco |
| Labirinto das Palavras | Confuso, corredores tortos | Roxo, verde-azulado, cinza |
| Núcleo da Dislexia | Escuro e instável | Preto, vermelho-escuro, roxo |

Sempre **alto contraste** entre o personagem, os inimigos e o fundo.

## Lista de assets

### Personagem principal

- **Readapt**: robô pequeno, protetor e inteligente. Animações: parado, andando nas 4 direções, atacando, levando dano.

### Inimigos

- Letra Torta, Sílaba Quebrada, Palavra Embaralhada e Criatura da Confusão
- **Chefe**: a entidade da Dislexia, uma criatura enorme feita de letras embaralhadas

### Personagens secundários

- A criança presa no mundo da Dislexia
- Pequenos robôs auxiliares e criaturas amigáveis (fragmentos de memória)

### Obstáculos e ambiente

- Portas (aberta, trancada), paredes e pisos de cada cenário
- Letras e símbolos corrompidos, plataformas bloqueadas, áreas escuras

### Itens e interface

- Coração de vida (cheio, vazio), ícones de upgrade, botões da tela inicial
- Tela de vitória e tela de derrota

## Texto e fontes

- Usar fontes feitas para legibilidade, como **Lexend** ou **OpenDyslexic**, em tamanho grande.
- Letras das atividades bem grandes, com bastante espaço entre elas e entre as linhas.
- Evitar texto em maiúsculas longas, texto itálico e fundos com muito ruído atrás das palavras.
- Letras que parecem muito iguais (b/d, p/q) devem aparecer com cuidado e sempre em contexto claro.

## Acessibilidade e conforto

- Sem texto piscando e sem efeitos de tela com flashes fortes.
- Sem cronômetro apertado nas atividades; o erro deve ensinar, não punir demais (o GDD fala em superar o medo de errar).
- Mensagens de feedback curtas, positivas e claras.
- Botão para ligar ou desligar sons e música.

## Sons (se sobrar tempo)

- Efeitos retrô gerados por código: ataque, acerto, dano, porta abrindo, vitória.
- Música curta em loop, suave no início e mais tensa no chefe.
