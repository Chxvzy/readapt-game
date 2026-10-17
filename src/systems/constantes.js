// Medidas gerais do jogo. Mexa com cuidado: muita coisa depende disso.
window.RD = window.RD || {};

RD.LARGURA = 960;          // largura da tela do jogo
RD.TOPO = 80;              // altura da barra de cima (HUD)
RD.TILE = 48;              // tamanho de cada quadradinho da sala
RD.COLS = 20;              // quadradinhos na largura da sala
RD.LINHAS = 12;            // quadradinhos na altura da sala
RD.ALTURA = RD.TOPO + RD.LINHAS * RD.TILE; // 80 + 576 = 656
RD.PIXEL = 3;              // cada "pixel" da arte vira 3x3 na tela

// Fonte de todos os textos do jogo: OpenDyslexic (feita para quem tem dislexia)
RD.FONTE = 'OpenDyslexic, Lexend, Verdana, Arial, sans-serif';
// Letras dos objetos do mapa (pedras e letras riscadas no chão)
RD.FONTE_DISLEXIA = 'OpenDyslexic, Lexend, Verdana, Arial, sans-serif';

// Centro da área da sala (abaixo da HUD)
RD.CENTRO_X = RD.LARGURA / 2;
RD.CENTRO_Y = RD.TOPO + (RD.LINHAS * RD.TILE) / 2;

// Converte coluna/linha da sala (0 a 19 / 0 a 11) em posição na tela
RD.posTile = function (col, lin) {
    return { x: col * RD.TILE + RD.TILE / 2, y: RD.TOPO + lin * RD.TILE + RD.TILE / 2 };
};

// Regras de jogo fáceis de ajustar
RD.REGRAS = {
    vidaInicial: 10,        // em meios corações (10 = 5 corações)
    velocidadeJogador: 210,
    intervaloTiro: 300,     // ms entre um tiro e outro
    velocidadeTiro: 430,
    alcanceTiro: 650,       // ms que o tiro dura
    invulneravel: 1000,     // ms sem levar dano depois de apanhar
    chanceCoracao: 0.15,    // chance de um inimigo deixar meio coração
    errosAteDica: 3,        // erros numa rodada até a resposta ser destacada (sem upgrade)
};

// Direções do Readapt e o desenho dele parado em cada uma
RD.DIRECOES = ['frente', 'costas', 'direita', 'esquerda'];
RD.TEXTURA_PARADO = { frente: 'readapt', costas: 'readapt_costas', direita: 'readapt_direita', esquerda: 'readapt_esquerda' };

// Qualidade da imagem: o jogo é desenhado em dobro (1920 x 1312) e a câmera
// aproxima 2x. Assim tudo fica nítido em telas grandes, sem mudar as posições.
RD.ZOOM = 2;
RD.camera = function (cena) {
    cena.cameras.main.setZoom(RD.ZOOM).centerOn(RD.LARGURA / 2, RD.ALTURA / 2);
};
