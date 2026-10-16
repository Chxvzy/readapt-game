// =====================================================================
// TEXTOS DO JOGO
// Aqui ficam a história, as falas e as mensagens. Pode editar à vontade:
// só mantenha as aspas e as vírgulas no lugar.
// =====================================================================

RD.TEXTOS = {
    // Páginas da história mostradas antes de começar
    historia: [
        'No futuro, num laboratório de tecnologia educacional, nasce o Readapt: um robô criado para ajudar crianças a ler.',
        'Ao analisar a mente de uma criança, o sistema encontra um mundo bagunçado. As letras se torcem, as palavras se embaralham e o medo de errar ganha forma.',
        'A Dislexia virou uma criatura que prende a criança nesse mundo. Readapt é enviado para lá. Ele vai restaurar as palavras e trazer a criança de volta!',
    ],

    // Como jogar (tela inicial)
    comoJogar: [
        'WASD: andar',
        'Setas: atirar o pulso de restauração',
        'E: conversar e ouvir a palavra',
        'Esc: pausar      M: som',
        '',
        'Limpe as salas para abrir as portas.',
        'Nas atividades, atire nas letras ou sílabas certas.',
        'Paredes rachadas escondem salas secretas!',
    ],

    // Personagens que conversam com o Readapt
    npcs: {
        bip: {
            nome: 'Bip',
            textura: 'npc_bip',
            falas: [
                'Oi, Readapt! Eu sou o Bip, um robô ajudante. Bem-vindo ao Mundo das Letras!',
                'Use W, A, S e D para andar. Use as setas do teclado para atirar o seu pulso de restauração.',
                'Quando você entra numa sala com criaturas, as portas trancam. Restaure todas para abrir!',
                'Nas atividades, atire nas letras na ordem certa. Errar faz parte de aprender. Tente com calma!',
                'Viu uma parede rachada? Atire nela. Às vezes ela esconde uma sala secreta!',
            ],
        },
        fragmento: {
            nome: 'Fragmento de memória',
            textura: 'fragmento_memoria',
            falas: [
                'Olá... eu sou uma lembrança da criança. Lembro do dia em que ela leu a primeira palavra!',
                'Ela ficou tão feliz. Quero que ela sinta isso de novo.',
                'Leve isto com você: o Escaneamento. Quando errar, ele mostra a resposta certa por um instante.',
            ],
            presente: 'escaneamento',
        },
    },

    // Dicas escritas no chão da primeira sala
    dicasChao: [
        { texto: 'WASD para andar', col: 4, lin: 8 },
        { texto: 'Setas para atirar', col: 15, lin: 8 },
        { texto: 'E perto do Bip para conversar', col: 10, lin: 10 },
    ],

    // Frase na barra de cima para cada tipo de sala
    salas: {
        inicio: 'Fale com o Bip (tecla E) e siga pelas portas',
        combate: 'Restaure as criaturas para abrir as portas',
        limpa: 'Sala limpa! Escolha uma porta',
        secreta: 'Você achou uma sala secreta!',
        amigo: 'Uma criatura amigável! Chegue perto e aperte E',
        passagem: 'Entre no portal para seguir em frente',
        atividadeFeita: 'Atividade concluída!',
    },

    // Mensagens curtas e positivas
    feedback: {
        acerto: ['Muito bem!', 'Isso mesmo!', 'Você conseguiu!', 'Ótimo!', 'Mandou bem!'],
        erro: ['Quase! Tente outra.', 'Ainda não. Você consegue!', 'Leia com calma e tente de novo.'],
        portas: 'As portas abriram!',
        segredo: 'Uma sala secreta apareceu!',
        escaneamento: 'Escaneamento: a resposta certa brilhou!',
        dicaErros: 'Dica: a resposta certa está brilhando.',
        rachadura: 'Essa parede parece rachada...',
    },

    // Chefe final
    chefe: {
        nome: 'A Dislexia',
        entrada: 'A Dislexia está protegida! Encoste no livro brilhante para ler e enfraquecer ela.',
        escudo: 'Os tiros não passam pelo escudo. Encoste no livro brilhante!',
        fraca: 'Ela está fraca! Atire agora!',
        fase2: 'A Dislexia chamou letras tortas para ajudar!',
        fase3: 'Ela ficou mais rápida! Falta pouco!',
        bonus: 'Você fez {n} desafio(s) extra(s): a Dislexia começa mais fraca!',
        derrota: 'As letras voltaram para o lugar!',
    },

    // Os 3 finais
    finais: {
        ruim: {
            titulo: 'A criança continua presa...',
            texto: 'O Readapt ficou sem energia, e a Dislexia segurou a criança no mundo bagunçado. Mas errar faz parte de aprender. Vamos tentar de novo?',
        },
        normal: {
            titulo: 'Readapt salvou a criança!',
            texto: 'A Dislexia foi vencida. As letras se acalmaram, e a criança abriu um livro e leu sem medo. Missão cumprida!',
            dica: 'Dica: faça todas as atividades e encontre as salas secretas para ver o final verdadeiro.',
        },
        verdadeiro: {
            titulo: 'O mundo foi totalmente restaurado!',
            texto: 'Cada palavra voltou ao lugar e a escuridão sumiu de vez. A criança lê com alegria e confiança, e o Readapt volta ao laboratório com orgulho. Final verdadeiro!',
        },
    },
};
