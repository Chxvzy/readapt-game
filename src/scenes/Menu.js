// Tela inicial: o Readapt iluminado no centro, a Dislexia gigante na sombra,
// faíscas de letras subindo e o menu ao lado (inspirado em Isaac / Enter the Gungeon).
RD.CenaMenu = class extends Phaser.Scene {
    constructor() { super('Menu'); }

    create() {
        RD.camera(this);
        const W = RD.LARGURA, H = RD.ALTURA;
        this.painel = null;
        this.cameras.main.setBackgroundColor('#07060c');

        this.criarCenario();
        this.criarLogo();
        this.criarOpcoes();

        this.add.text(W - 20, H - 44, 'WASD: andar  •  Setas ou Espaço: atirar  •  Enter: escolher',
            RD.UI.estilo(15, '#8a90ad')).setOrigin(1, 0.5).setDepth(40);
        this.add.text(W - 20, H - 20, 'Projeto de TCC • Colégio UNASP', RD.UI.estilo(13, '#5d627c')).setOrigin(1, 0.5).setDepth(40);

        this.cameras.main.fadeIn(900, 0, 0, 0);
    }

    // ------------------------------------------------------------------
    criarCenario() {
        const W = RD.LARGURA, H = RD.ALTURA;
        const cx = 560; // centro do palco (o menu fica à esquerda)

        // A Dislexia gigante na sombra, respirando
        const chefe = this.add.image(cx + 40, 250, 'chefe_dislexia').setScale(2.7).setTint(0x2a1238).setAlpha(0.95).setDepth(1);
        this.tweens.add({ targets: chefe, scale: 2.8, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        // olhos vermelhos brilhando
        [[-18, -12], [18, -12]].forEach(([ox, oy]) => {
            const olho = this.add.image(chefe.x + ox * 2.7, chefe.y + oy * 2.7, 'brilho').setTint(0xff2a2a)
                .setScale(0.55).setBlendMode(Phaser.BlendModes.ADD).setDepth(2);
            const nucleo = this.add.rectangle(olho.x, olho.y, 22, 22, 0xff4d4d).setDepth(2);
            this.tweens.add({ targets: [olho, nucleo], alpha: { from: 0.65, to: 1 }, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        });

        // Névoa passando devagar
        for (let i = 0; i < 5; i++) {
            const n = this.add.image(Phaser.Math.Between(0, W), Phaser.Math.Between(180, 420), 'nevoa')
                .setTint(0x6a5a9a).setAlpha(0.14).setScale(Phaser.Math.FloatBetween(1.5, 2.6)).setDepth(3);
            this.tweens.add({
                targets: n, x: n.x + Phaser.Math.Between(-260, 260), duration: Phaser.Math.Between(9000, 15000),
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            });
        }

        // Chão do porão na parte de baixo, sumindo no escuro
        this.add.tileSprite(W / 2, 530, W, 260, 'piso_letras').setDepth(4);
        this.add.image(W / 2, 530, 'detalhes_letras').setDisplaySize(W, 260).setDepth(4);
        this.add.image(W / 2, 400, 'degrade_cima').setDisplaySize(W, 170).setOrigin(0.5, 0).setDepth(5);
        this.add.rectangle(W / 2, 200, W, 400, 0x07060c, 0).setDepth(5);

        // Pedras com letras no chão
        [[70, 590, 1.3], [140, 625, 1], [880, 610, 1.2], [930, 560, 0.9]].forEach(([x, y, e]) =>
            this.add.image(x, y, 'bloco_letras').setScale(e).setDepth(6));

        // Feixe de luz sobre o Readapt
        const feixe = this.add.image(cx, 230, 'feixe').setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.32).setDepth(7);
        this.tweens.add({ targets: feixe, alpha: 0.42, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        const chao = this.add.image(cx, 520, 'brilho').setTint(0xffe6a8).setScale(3.4, 1).setAlpha(0.45)
            .setBlendMode(Phaser.BlendModes.ADD).setDepth(7);
        this.tweens.add({ targets: chao, alpha: 0.6, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        // Inimigos espreitando no escuro (lado direito)
        const inimigos = [
            ['criatura_confusao', 700, 390, 2.0, 0.35],
            ['silaba_quebrada', 900, 440, 2.4, 0.6],
            ['letra_torta', 800, 520, 3.0, 0.85],
        ];
        inimigos.forEach(([tex, x, y, esc, alfa], i) => {
            this.add.image(x, y + esc * 20, 'sombra').setScale(esc * 0.9).setAlpha(alfa).setDepth(8);
            const en = this.add.image(x, y, tex).setScale(esc * ((RD.Arte.escalas && RD.Arte.escalas[tex]) || 1)).setAlpha(alfa).setTint(0xb0b0c0).setDepth(9);
            this.tweens.add({ targets: en, angle: { from: -8, to: 8 }, duration: 900 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        });

        // O Readapt, grande e iluminado
        this.add.image(cx, 545, 'sombra').setScale(3.2).setDepth(10);
        const robo = this.add.image(cx, 452, 'readapt').setScale(3.6).setDepth(11);
        this.tweens.add({ targets: robo, y: 440, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        // Faíscas subindo
        this.add.particles(0, 0, 'faisca', {
            x: { min: 0, max: W }, y: H + 10,
            lifespan: 5200, speedY: { min: -70, max: -25 }, speedX: { min: -12, max: 12 },
            scale: { start: 0.9, end: 0 }, alpha: { start: 0.9, end: 0 },
            tint: [0xffd23f, 0xff8c1a, 0xff5a4e], frequency: 140, blendMode: 'ADD',
        }).setDepth(12);

        // Letras subindo devagar, como cinzas
        const letras = 'ABCDEFGHIJLMNOPRSTUVZ';
        this.time.addEvent({
            delay: 700, loop: true, callback: () => {
                const t = this.add.text(Phaser.Math.Between(40, W - 40), H + 20, letras[Phaser.Math.Between(0, letras.length - 1)],
                    RD.UI.estilo(Phaser.Math.Between(18, 34), '#ffcf70', { fontStyle: '700' }))
                    .setOrigin(0.5).setAlpha(0).setAngle(Phaser.Math.Between(-30, 30)).setDepth(3);
                this.tweens.add({ targets: t, alpha: 0.35, duration: 1500, yoyo: true, hold: 2500 });
                this.tweens.add({
                    targets: t, y: Phaser.Math.Between(120, 360), angle: t.angle + Phaser.Math.Between(-40, 40),
                    duration: 5500, onComplete: () => t.destroy(),
                });
            },
        });

        this.add.image(W / 2, H / 2, 'vinheta_tela').setDepth(30);
    }

    // ------------------------------------------------------------------
    criarLogo() {
        const W = RD.LARGURA;
        const palavra = 'Readapt';
        const estilo = RD.UI.estilo(96, '#f2ead8', {
            fontStyle: '700', stroke: '#000000', strokeThickness: 12,
            shadow: { offsetX: 0, offsetY: 8, color: '#000000', blur: 0, fill: true, stroke: true },
        });
        const letras = palavra.split('').map(l => this.add.text(0, 0, l, estilo).setOrigin(0.5).setDepth(35));
        const total = letras.reduce((s, t) => s + t.width - 12, 0);
        let x = W / 2 - total / 2;
        letras.forEach((t, i) => {
            x += (t.width - 12) / 2;
            t.setPosition(x, 82);
            x += (t.width - 12) / 2;
            // cada letra balança um pouquinho, fora de sincronia
            this.tweens.add({ targets: t, y: 76, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 140 });
        });
        this.letrasLogo = letras;

        // De vez em quando uma letra "entorta" e volta (o tema do jogo)
        this.time.addEvent({
            delay: 2600, loop: true, callback: () => {
                const t = Phaser.Utils.Array.GetRandom(letras);
                this.tweens.add({
                    targets: t, scaleX: -1, angle: Phaser.Math.Between(-20, 20), duration: 260, ease: 'Sine.easeInOut',
                    yoyo: true, hold: 500,
                });
            },
        });

        // Fita vermelha com o subtítulo
        const fita = this.add.graphics().setDepth(34);
        fita.fillStyle(0x000000, 1);
        fita.fillPoints([{ x: W / 2 - 190, y: 143 }, { x: W / 2 + 190, y: 137 }, { x: W / 2 + 200, y: 185 }, { x: W / 2 - 200, y: 191 }], true);
        fita.fillStyle(0x8f1d18, 1);
        fita.fillPoints([{ x: W / 2 - 184, y: 147 }, { x: W / 2 + 184, y: 141 }, { x: W / 2 + 193, y: 181 }, { x: W / 2 - 193, y: 187 }], true);
        fita.fillStyle(0xb3261e, 1);
        fita.fillPoints([{ x: W / 2 - 184, y: 147 }, { x: W / 2 + 184, y: 141 }, { x: W / 2 + 186, y: 150 }, { x: W / 2 - 186, y: 156 }], true);
        this.add.text(W / 2, 163, 'Dyslexi-Trouble', RD.UI.estilo(30, '#ffe9c9', {
            fontStyle: '700', stroke: '#3a0a07', strokeThickness: 6,
        })).setOrigin(0.5).setAngle(-1).setDepth(35);
    }

    // ------------------------------------------------------------------
    criarOpcoes() {
        const jogar = RD.UI.itemMenu(this, 64, 330, 'Jogar', () => this.jogar()).setDepth(36);
        const como = RD.UI.itemMenu(this, 64, 395, 'Como jogar', () => this.mostrarComoJogar()).setDepth(36);
        const som = RD.UI.itemMenu(this, 64, 460, this.textoSom(), () => {
            RD.Som.alternar();
            som.mudarTexto(this.textoSom());
        }).setDepth(36);
        this.itens = [jogar, como, som];
        this.menu = RD.UI.menu(this, this.itens);
        this.events.once('shutdown', () => {
            if (this.menu) this.menu.destruir();
            if (this.painelMenu) this.painelMenu.destruir();
        });
    }

    textoSom() {
        return 'Som: ' + (RD.Som.ligado ? 'ligado' : 'desligado');
    }

    jogar() {
        if (this.saindo || this.painel) return;
        this.saindo = true;
        RD.Estado.comecar();
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Historia'));
    }

    // ------------------------------------------------------------------
    // Como jogar: teclas desenhadas e dicas com ícones do próprio jogo
    mostrarComoJogar() {
        if (this.painel) return;
        // o menu de trás fica desligado e escondido enquanto a explicação está aberta
        this.menu.destruir();
        this.menu = null;
        this.itens.forEach(it => it.setVisible(false).disableInteractive());
        const W = RD.LARGURA, H = RD.ALTURA;
        const c = this.add.container(0, 0).setDepth(60);
        this.painel = c;
        c.add(this.add.rectangle(W / 2, H / 2, W, H, 0x07060c, 1));
        c.add(this.add.text(W / 2, 52, 'Como jogar', RD.UI.estilo(42, '#ffd23f', { fontStyle: '700', stroke: '#000000', strokeThickness: 8 })).setOrigin(0.5));
        c.add(this.add.rectangle(W / 2, 88, 360, 3, 0xb3261e));

        // duas caixas lado a lado, cada uma com seu espaço
        const caixa = (x, w, titulo) => {
            c.add(this.add.rectangle(x + w / 2, 318, w, 420, 0x14111f, 1).setStrokeStyle(2, 0x3a3150));
            c.add(this.add.text(x + 20, 122, titulo, RD.UI.estilo(23, '#ff8c7a', { fontStyle: '700' })));
        };
        caixa(30, 430, 'Controles');
        caixa(480, 450, 'Dicas');

        // --- caixa da esquerda: controles ---
        // teclas um pouco menores, cada controle numa linha separada por um risco fino
        const T = (x, y, r, w) => c.add(RD.UI.tecla(this, x, y, r, w).setScale(0.75));
        const rotulo = (y, txt) => c.add(this.add.text(205, y, txt,
            RD.UI.estilo(19, '#e9e2d0', { fontStyle: '600' })).setOrigin(0, 0.5));
        const risco = (y) => c.add(this.add.rectangle(245, y, 390, 2, 0x2a2340));

        T(105, 178, 'W'); T(67, 214, 'A'); T(105, 214, 'S'); T(143, 214, 'D');
        rotulo(196, 'Andar');
        risco(246);
        T(105, 274, '↑'); T(67, 310, '←'); T(105, 310, '↓'); T(143, 310, '→');
        rotulo(292, 'Mirar e atirar');
        risco(342);
        T(105, 368, 'Espaço', 130);
        rotulo(368, 'Atirar para a frente');
        risco(396);
        T(105, 422, 'E');
        rotulo(422, 'Conversar / ouvir');
        risco(450);
        T(84, 478, 'Esc', 62); T(134, 478, 'M');
        rotulo(478, 'Pausar  •  Som');

        // --- caixa da direita: dicas ---
        const dica = (y, tex, escala, txt, extra) => {
            c.add(this.add.image(530, y, tex).setScale(escala));
            if (extra) c.add(extra(530, y));
            c.add(this.add.text(575, y, txt, RD.UI.estilo(17, '#e9e2d0', { fontStyle: '600', wordWrap: { width: 340 }, lineSpacing: 2 })).setOrigin(0, 0.5));
        };
        dica(190, 'porta_trancada', 0.5, 'Restaure as criaturas para abrir as portas.');
        dica(262, RD.Arte.letra3D(this, 'A'), 0.6 * RD.Arte.ESCALA_LETRA, 'Nas atividades, atire nas letras na ordem certa.');
        dica(334, 'rachada_letras', 0.45, 'Paredes rachadas escondem salas secretas.');
        dica(406, 'livro', 0.9, 'No chefe, encoste no livro brilhante e responda.');
        dica(478, 'coracao_meio', 0.9, 'Errar faz parte de aprender: tente com calma!');

        const voltar = RD.UI.itemMenu(this, W / 2 - 60, 580, 'Voltar', () => this.fecharComoJogar());
        c.add(voltar);
        this.painelMenu = RD.UI.menu(this, [voltar]);
        this.input.keyboard.once('keydown-ESC', () => this.fecharComoJogar());
        c.setAlpha(0);
        this.tweens.add({ targets: c, alpha: 1, duration: 250 });
    }

    fecharComoJogar() {
        if (!this.painel) return;
        this.painelMenu.destruir();
        this.painelMenu = null;
        this.painel.destroy();
        this.painel = null;
        // liga de novo o menu, com "Como jogar" selecionado
        this.itens.forEach(it => it.setVisible(true).setInteractive({ useHandCursor: true }));
        this.menu = RD.UI.menu(this, this.itens);
        this.input.keyboard.emit('keydown-DOWN');
    }
};
