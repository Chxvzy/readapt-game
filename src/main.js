// Configuração do Phaser. Este arquivo é carregado por último no index.html.
RD.jogo = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'jogo',
    width: RD.LARGURA,
    height: RD.ALTURA,
    backgroundColor: '#0d1024',
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
