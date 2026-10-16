// =====================================================================
// MAPAS DOS 3 CENÁRIOS
// ---------------------------------------------------------------------
// Cada sala tem uma posição "x,y" na grade do mapa:
//   x aumenta para a DIREITA, y aumenta para BAIXO.
// Duas salas vizinhas (ex.: '1,0' e '2,0') ganham uma porta entre elas.
//
// Tipos de sala:
//   inicio     primeira sala (com o Bip)
//   combate    criaturas que trancam as portas até serem derrotadas
//   atividade  atividade educativa que tranca as portas até ser concluída
//   secreta    sala escondida atrás de uma parede rachada (tem um upgrade)
//   amigo      criatura amigável que conversa e dá um presente
//   passagem   portal para o próximo cenário
//   chefe      leva para a luta contra a Dislexia
//
// Campos extras:
//   atividade: 'nome'   (veja src/data/atividades.js)
//   opcional: true      atividade extra (conta para o final verdadeiro
//                       e deixa o chefe mais fraco)
//   item: 'nome'        upgrade da sala (veja src/data/itens.js)
//   npc: 'nome'         personagem que conversa (veja src/data/textos.js)
//
// "mapa" desenha o miolo da sala (18 colunas x 10 linhas):
//   .  chão       #  bloco
//   L  Letra Torta       S  Sílaba Quebrada
//   P  Palavra Embaralhada       C  Criatura da Confusão
// Deixe livre a frente das portas (as 3 primeiras colunas dos lados,
// as 3 primeiras linhas de cima e de baixo no meio da sala).
// =====================================================================

RD.CENARIOS = [
    // ===================== 1. MUNDO DAS LETRAS =====================
    {
        id: 'letras',
        nome: 'Mundo das Letras',
        subtitulo: 'Letras flutuando e palavras incompletas',
        inicio: '0,0',
        escuro: false,
        forcaInimigos: 1,
        letrasFundo: { quantidade: 9, cor: '#9fb3ff', alfa: 0.08 },
        salas: {
            '0,0': { tipo: 'inicio', npc: 'bip' },
            '1,0': {
                tipo: 'combate',
                mapa: [
                    '..................',
                    '..................',
                    '...L..........L...',
                    '..................',
                    '..................',
                    '..................',
                    '..................',
                    '.........L........',
                    '..................',
                    '..................',
                ],
            },
            '1,-1': { tipo: 'secreta', item: 'pulso_forte' },
            '2,0': { tipo: 'atividade', atividade: 'letras_gato' },
            '2,1': { tipo: 'atividade', atividade: 'letras_extra', opcional: true },
            '3,0': {
                tipo: 'combate',
                mapa: [
                    '..................',
                    '..##..........##..',
                    '..##..........##..',
                    '.........S........',
                    '.....L......L.....',
                    '..................',
                    '..................',
                    '..##..........##..',
                    '..##..........##..',
                    '..................',
                ],
            },
            '4,0': { tipo: 'atividade', atividade: 'letras_casa' },
            '4,1': { tipo: 'passagem' },
        },
    },

    // ===================== 2. LABIRINTO DAS PALAVRAS =====================
    {
        id: 'labirinto',
        nome: 'Labirinto das Palavras',
        subtitulo: 'Corredores confusos e caminhos embaralhados',
        inicio: '0,0',
        escuro: false,
        forcaInimigos: 1.35,
        letrasFundo: { quantidade: 6, cor: '#7fe0d0', alfa: 0.08 },
        salas: {
            '0,0': {
                tipo: 'combate',
                mapa: [
                    '..................',
                    '..................',
                    '...#####..#####...',
                    '...#..........#...',
                    '......L....L......',
                    '..................',
                    '...#..........#...',
                    '...#####..#####...',
                    '..................',
                    '..................',
                ],
            },
            '1,0': {
                tipo: 'combate',
                mapa: [
                    '..................',
                    '.P..............P.',
                    '....###....###....',
                    '....#........#....',
                    '..................',
                    '..................',
                    '....#........#....',
                    '....###....###....',
                    '..................',
                    '..................',
                ],
            },
            '0,1': { tipo: 'amigo', npc: 'fragmento' },
            '1,1': { tipo: 'atividade', atividade: 'lab_animais' },
            '2,0': { tipo: 'secreta', item: 'coracao_extra' },
            '2,1': {
                tipo: 'combate',
                mapa: [
                    '..................',
                    '..................',
                    '...##........##...',
                    '...#..C....C..#...',
                    '..................',
                    '..................',
                    '...#....L.....#...',
                    '...##........##...',
                    '..................',
                    '..................',
                ],
            },
            '2,2': { tipo: 'atividade', atividade: 'lab_silabas' },
            '3,2': {
                tipo: 'combate',
                mapa: [
                    '..................',
                    '..P...............',
                    '.....##....##.....',
                    '..................',
                    '....S........C....',
                    '..................',
                    '.....##....##.....',
                    '.............L....',
                    '..................',
                    '..................',
                ],
            },
            '3,3': { tipo: 'atividade', atividade: 'lab_extra', opcional: true },
            '4,2': { tipo: 'atividade', atividade: 'lab_final' },
            '5,2': { tipo: 'passagem' },
        },
    },

    // ===================== 3. NÚCLEO DA DISLEXIA =====================
    {
        id: 'nucleo',
        nome: 'Núcleo da Dislexia',
        subtitulo: 'Escuro e instável. A Dislexia está perto...',
        inicio: '0,0',
        escuro: true,   // salas de combate ficam escuras até serem limpas
        forcaInimigos: 1.6,
        letrasFundo: { quantidade: 7, cor: '#ff4d6d', alfa: 0.1 },
        salas: {
            '0,0': {
                tipo: 'combate',
                mapa: [
                    '..................',
                    '..................',
                    '....C.........C...',
                    '..................',
                    '..................',
                    '..................',
                    '.......####.......',
                    '.......####.......',
                    '..................',
                    '..................',
                ],
            },
            '1,0': { tipo: 'atividade', atividade: 'nucleo_silabas' },
            '1,1': {
                tipo: 'combate',
                mapa: [
                    '..................',
                    '..##..........##..',
                    '..##..........##..',
                    '..................',
                    '....S...P....S....',
                    '..................',
                    '..................',
                    '..##..........##..',
                    '..##..........##..',
                    '..................',
                ],
            },
            '1,2': { tipo: 'atividade', atividade: 'nucleo_extra', opcional: true },
            '2,1': {
                tipo: 'combate',
                mapa: [
                    '..................',
                    '..................',
                    '...L..........L...',
                    '.....##....##.....',
                    '.....#......#.....',
                    '.....#......#.....',
                    '.....##....##.....',
                    '..........P.......',
                    '.........C........',
                    '..................',
                ],
            },
            '3,1': { tipo: 'chefe' },
        },
    },
];
