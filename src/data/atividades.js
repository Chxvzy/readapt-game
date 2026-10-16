// =====================================================================
// ATIVIDADES EDUCATIVAS
// ---------------------------------------------------------------------
// Dois tipos:
//
// 1) 'palavra' (palavra embaralhada): as letras aparecem soltas na sala e
//    a criança atira nelas na ordem certa.
//      { palavra: 'GATO', dica: '🐱' }
//
// 2) 'silaba' (sílaba que falta): aparece a palavra com uma sílaba faltando
//    e a criança atira na sílaba certa entre 3 opções.
//      { partes: ['CA', 'SA'], falta: 0, opcoes: ['CA', 'LU', 'FI'], dica: '🏠' }
//      - partes: as sílabas da palavra, em ordem
//      - falta: qual parte está escondida (0 = primeira, 1 = segunda...)
//      - opcoes: as 3 opções (uma delas é a certa)
//
// Regras para escrever bem as atividades:
//   - Palavras simples, do dia a dia, em LETRA MAIÚSCULA e sem acento.
//   - Não use letras parecidas como opções erradas (B/D, P/Q, M/N).
//   - Cada atividade pode ter várias rodadas (a lista "rodadas").
// =====================================================================

RD.ATIVIDADES = {
    // ---------- Mundo das Letras ----------
    letras_gato: {
        tipo: 'palavra',
        rodadas: [
            { palavra: 'GATO', dica: '🐱' },
        ],
    },
    letras_casa: {
        tipo: 'silaba',
        rodadas: [
            { partes: ['CA', 'SA'], falta: 0, opcoes: ['CA', 'LU', 'FI'], dica: '🏠' },
        ],
    },
    letras_extra: {
        tipo: 'palavra',
        rodadas: [
            { palavra: 'SOL', dica: '☀️' },
            { palavra: 'LUA', dica: '🌙' },
        ],
    },

    // ---------- Labirinto das Palavras ----------
    lab_animais: {
        tipo: 'palavra',
        rodadas: [
            { palavra: 'PATO', dica: '🦆' },
            { palavra: 'SAPO', dica: '🐸' },
        ],
    },
    lab_silabas: {
        tipo: 'silaba',
        rodadas: [
            { partes: ['JA', 'NE', 'LA'], falta: 1, opcoes: ['NE', 'MO', 'TU'], dica: '🪟' },
            { partes: ['MA', 'CA', 'CO'], falta: 1, opcoes: ['CA', 'LI', 'VE'], dica: '🐒' },
        ],
    },
    lab_extra: {
        tipo: 'palavra',
        rodadas: [
            { palavra: 'UVA', dica: '🍇' },
            { palavra: 'VACA', dica: '🐄' },
        ],
    },
    lab_final: {
        tipo: 'palavra',
        rodadas: [
            { palavra: 'LIVRO', dica: '📖' },
            { palavra: 'FOGUETE', dica: '🚀' },
        ],
    },

    // ---------- Núcleo da Dislexia ----------
    nucleo_silabas: {
        tipo: 'silaba',
        rodadas: [
            { partes: ['TO', 'MA', 'TE'], falta: 1, opcoes: ['MA', 'RI', 'SU'], dica: '🍅' },
            { partes: ['CA', 'VA', 'LO'], falta: 1, opcoes: ['VA', 'MI', 'TU'], dica: '🐴' },
        ],
    },
    nucleo_extra: {
        tipo: 'palavra',
        rodadas: [
            { palavra: 'ESTRELA', dica: '⭐' },
        ],
    },
};

// =====================================================================
// PERGUNTAS DO CHEFE FINAL
// A criança escolhe entre 3 opções (teclas 1, 2, 3, setas + Enter ou mouse).
//   - pergunta: o que aparece em cima
//   - dica: figura
//   - texto: palavra com espaço vazio (opcional)
//   - opcoes: as 3 opções (a PRIMEIRA é sempre a certa; o jogo embaralha)
// =====================================================================

RD.PERGUNTAS_CHEFE = [
    { pergunta: 'Qual palavra está escrita certo?', dica: '🐟', opcoes: ['PEIXE', 'PIEXE', 'XEIPE'] },
    { pergunta: 'Qual sílaba completa a palavra?', dica: '🍌', texto: 'BA  NA  __', opcoes: ['NA', 'TO', 'LE'] },
    { pergunta: 'Qual palavra está escrita certo?', dica: '🌸', opcoes: ['FLOR', 'FORL', 'LFOR'] },
    { pergunta: 'Qual sílaba completa a palavra?', dica: '🦒', texto: 'GI  RA  __', opcoes: ['FA', 'SO', 'MU'] },
    { pergunta: 'Qual palavra está escrita certo?', dica: '🚗', opcoes: ['CARRO', 'CAROR', 'RACRO'] },
    { pergunta: 'Qual sílaba completa a palavra?', dica: '🍓', texto: 'MO  RAN  __', opcoes: ['GO', 'TI', 'LA'] },
    { pergunta: 'Qual palavra está escrita certo?', dica: '🐶', opcoes: ['CACHORRO', 'CAHCORRO', 'CACHOROR'] },
    { pergunta: 'Qual sílaba completa a palavra?', dica: '🥚', texto: 'O  __', opcoes: ['VO', 'MI', 'SA'] },
];
