// Configuração do Phaser. Este arquivo é carregado por último no index.html.
RD.jogo = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'jogo',
    // desenhado em dobro para ficar nítido (veja RD.ZOOM em constantes.js)
    width: RD.LARGURA * RD.ZOOM,
    height: RD.ALTURA * RD.ZOOM,
    backgroundColor: '#0d1024',
    pixelArt: true,      // pixels nítidos, sem borrar
    roundPixels: true,
    physics: {
        default: 'arcade',
        arcade: { debug: false },
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [RD.CenaBoot, RD.CenaMenu, RD.CenaHistoria, RD.CenaJogo, RD.CenaChefe, RD.CenaFim],
});
