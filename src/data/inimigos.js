// =====================================================================
// INIMIGOS
// vida: quantos tiros normais aguenta
// velocidade: rapidez do movimento
// Outros campos explicados ao lado.
// Nos mapas, cada inimigo tem uma letra: L, S, P, C.
// =====================================================================

RD.INIMIGOS = {
    letra_torta: {
        nome: 'Letra Torta',
        textura: 'letra_torta',
        corTinta: 0xe63946,       // cor da mancha que fica no chão
        letraNoMapa: 'L',
        vida: 3,
        velocidade: 60,
        comportamento: 'perseguir',
    },
    silaba_quebrada: {
        nome: 'Sílaba Quebrada',
        textura: 'silaba_quebrada',
        corTinta: 0xff8c1a,
        letraNoMapa: 'S',
        vida: 4,
        velocidade: 48,
        comportamento: 'perseguir',
        divideEm: 'silaba_pedaco',      // ao ser derrotada vira 2 pedaços
    },
    silaba_pedaco: {
        nome: 'Pedaço de Sílaba',
        textura: 'silaba_pedaco',
        corTinta: 0xffb347,
        vida: 1,
        velocidade: 95,
        comportamento: 'perseguir',
    },
    palavra_embaralhada: {
        nome: 'Palavra Embaralhada',
        textura: 'palavra_embaralhada',
        corTinta: 0x3fbf5f,
        letraNoMapa: 'P',
        vida: 5,
        velocidade: 0,
        comportamento: 'atirar',
        intervaloTiro: 1900,           // ms entre os tiros
        velocidadeTiro: 170,
    },
    criatura_confusao: {
        nome: 'Criatura da Confusão',
        textura: 'criatura_confusao',
        corTinta: 0xb08cff,
        letraNoMapa: 'C',
        vida: 3,
        velocidade: 190,
        comportamento: 'pular',
        intervaloPulo: 1700,           // ms entre uma mudança de lugar e outra
    },
};
