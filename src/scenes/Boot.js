// Carrega as artes prontas (se houver), espera a fonte e gera os sprites.
RD.CenaBoot = class extends Phaser.Scene {
    constructor() { super('Boot'); }

    preload() {
        this.add.text(RD.LARGURA / 2, RD.ALTURA / 2, 'Carregando...', RD.UI.estilo(28)).setOrigin(0.5);
        const prontas = window.ARTES_PRONTAS || [];
        prontas.forEach((nome) => this.load.image('arquivo_' + nome, 'assets/' + nome + '.png'));
        // Animação de andar do Readapt: 4 folhas com 6 quadros de 48x56 cada
        RD.DIRECOES.forEach((d) => this.load.spritesheet('readapt_andar_' + d, 'assets/readapt_andar_' + d + '.png',
            { frameWidth: 48, frameHeight: 56 }));
        // Animação de atirar: 4 folhas com 3 quadros de 48x56 cada
        RD.DIRECOES.forEach((d) => this.load.spritesheet('readapt_atirar_' + d, 'assets/readapt_atirar_' + d + '.png',
            { frameWidth: 48, frameHeight: 56 }));
        this.load.on('loaderror', (arquivo) => {
            console.warn('Não achei a arte "' + arquivo.src + '". Confira o nome do arquivo e a lista em assets/artes.js. Vou usar o desenho feito por código.');
        });
    }

    // Cria as animações de andar e de atirar. Se uma folha não carregou, usa o desenho parado.
    criarAnimacoes() {
        const folha = (chave, d, quadros) => {
            if (this.textures.exists(chave)) return;
            const parado = this.textures.get(RD.TEXTURA_PARADO[d]).getSourceImage();
            const t = this.textures.createCanvas(chave, 48 * quadros, 56);
            for (let i = 0; i < quadros; i++) {
                t.getContext().drawImage(parado, i * 48, (i % 2) * 2);
                t.add(i, 0, i * 48, 0, 48, 56);
            }
            t.refresh();
        };
        RD.DIRECOES.forEach((d) => {
            folha('readapt_andar_' + d, d, 6);
            folha('readapt_atirar_' + d, d, 3);
            if (!this.anims.exists('andar_' + d)) {
                this.anims.create({
                    key: 'andar_' + d,
                    frames: this.anims.generateFrameNumbers('readapt_andar_' + d, { start: 0, end: 5 }),
                    frameRate: 11, repeat: -1,
                });
            }
            if (!this.anims.exists('atirar_' + d)) {
                this.anims.create({
                    key: 'atirar_' + d,
                    frames: this.anims.generateFrameNumbers('readapt_atirar_' + d, { start: 0, end: 2 }),
                    frameRate: 20, repeat: 0,
                });
            }
        });
    }

    create() {
        // Espera a fonte Lexend carregar (no máximo 2 segundos)
        const fonte = document.fonts && document.fonts.load
            ? Promise.race([
                Promise.all([document.fonts.load('700 20px Lexend'), document.fonts.load('400 20px Lexend')]),
                new Promise(r => setTimeout(r, 2000)),
            ])
            : Promise.resolve();
        fonte.catch(() => { }).then(() => {
            RD.Arte.gerarTudo(this);
            this.criarAnimacoes();
            this.scene.start('Menu');
        });
    }
};
