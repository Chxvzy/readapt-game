// Introdução da história como uma cena de cinema: uma ilustração por página
// e o texto aparecendo aos poucos numa faixa preta embaixo.
RD.CenaHistoria = class extends Phaser.Scene {
    constructor() { super('Historia'); }

    create() {
        RD.camera(this);
        const W = RD.LARGURA, H = RD.ALTURA;
        this.pagina = 0;
        this.saindo = false;
        this.cameras.main.setBackgroundColor('#000000');

        this.palco = null;          // ilustração da página atual
        this.ALTURA_PALCO = 470;     // área da ilustração (o resto é a faixa do texto)

        // Faixa do texto (embaixo) e barra fina de cinema (em cima)
        this.add.rectangle(W / 2, (this.ALTURA_PALCO + H) / 2, W, H - this.ALTURA_PALCO, 0x000000).setDepth(50);
        this.add.rectangle(W / 2, this.ALTURA_PALCO + 1, W, 2, 0x2a2a3a).setDepth(51);
        this.add.rectangle(W / 2, 14, W, 28, 0x000000).setDepth(50);

        this.texto = this.add.text(W / 2, this.ALTURA_PALCO + 70, '', RD.UI.estilo(25, '#f2ead8', {
            align: 'center', wordWrap: { width: 820 }, lineSpacing: 10,
        })).setOrigin(0.5).setDepth(52);

        this.pontos = [];
        RD.TEXTOS.historia.forEach((_, i) => {
            this.pontos.push(this.add.circle(40 + i * 22, H - 22, 6, 0x5a5f7a).setDepth(52));
        });
        this.add.text(W - 20, H - 22, 'Enter: continuar   •   Esc: pular', RD.UI.estilo(15, '#7d86a3')).setOrigin(1, 0.5).setDepth(52);

        this.mostrar();
        const avancar = () => this.avancar();
        this.input.keyboard.on('keydown-ENTER', avancar);
        this.input.keyboard.on('keydown-SPACE', avancar);
        this.input.keyboard.on('keydown-E', avancar);
        this.input.on('pointerdown', avancar);
        this.input.keyboard.once('keydown-ESC', () => this.comecar());
        this.cameras.main.fadeIn(600, 0, 0, 0);
    }

    // ------------------------------------------------------------------
    // Texto aparecendo letra por letra (Enter mostra tudo de uma vez)
    escrever(frase) {
        if (this.evEscrita) this.evEscrita.remove();
        this.fraseAtual = frase;
        this.escrevendo = true;
        let n = 0;
        this.texto.setText('');
        this.evEscrita = this.time.addEvent({
            delay: 28, repeat: frase.length - 1, callback: () => {
                n++;
                this.texto.setText(frase.slice(0, n));
                if (n % 3 === 0 && frase[n - 1] !== ' ') RD.Som.tocar('fala');
                if (n >= frase.length) this.escrevendo = false;
            },
        });
    }

    mostrar() {
        this.pontos.forEach((p, i) => p.setFillStyle(i === this.pagina ? 0xffd23f : 0x5a5f7a));
        if (this.palco) { this.tweens.killAll(); this.palco.destroy(); }
        this.palco = this.add.container(0, 0).setDepth(1);
        [this.cenaLaboratorio, this.cenaMente, this.cenaAndares, this.cenaMissao][this.pagina].call(this, this.palco);

        // zoom bem lento na ilustração (efeito de cinema)
        this.palco.setScale(1);
        this.tweens.add({ targets: this.palco, scale: 1.05, x: -24, y: -10, duration: 9000, ease: 'Sine.easeOut' });

        this.escrever(RD.TEXTOS.historia[this.pagina]);
    }

    avancar() {
        if (this.saindo || this.trocando) return;
        if (this.escrevendo) {
            if (this.evEscrita) this.evEscrita.remove();
            this.texto.setText(this.fraseAtual);
            this.escrevendo = false;
            return;
        }
        RD.Som.tocar('menu');
        if (this.pagina + 1 >= RD.TEXTOS.historia.length) { this.comecar(); return; }
        this.trocando = true;
        this.cameras.main.fadeOut(250, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.pagina++;
            this.mostrar();
            this.cameras.main.fadeIn(350, 0, 0, 0);
            this.trocando = false;
        });
    }

    comecar() {
        if (this.saindo) return;
        this.saindo = true;
        if (this.evEscrita) this.evEscrita.remove();
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Jogo', { titulo: true }));
    }

    // ------------------------------------------------------------------
    // PÁGINA 1: o laboratório, com o Readapt numa cápsula
    cenaLaboratorio(p) {
        const W = RD.LARGURA, A = this.ALTURA_PALCO;
        const g = this.add.graphics();
        // parede com painéis
        g.fillGradientStyle(0x0d1630, 0x0d1630, 0x070b18, 0x070b18, 1);
        g.fillRect(0, 0, W, A);
        g.lineStyle(2, 0x16244a, 1);
        for (let x = 0; x < W; x += 80) g.lineBetween(x, 0, x, A - 120);
        for (let y = 40; y < A - 120; y += 70) g.lineBetween(0, y, W, y);
        // chão
        g.fillStyle(0x0a0f22, 1);
        g.fillRect(0, A - 120, W, 120);
        g.lineStyle(2, 0x1c2a55, 1);
        for (let x = -400; x < W + 400; x += 70) g.lineBetween(W / 2 + (x - W / 2) * 0.35, A - 120, x, A);
        p.add(g);

        // monitores com letras
        [[150, 150], [300, 120], [700, 130], [840, 165]].forEach(([x, y], i) => {
            p.add(this.add.rectangle(x, y, 120, 84, 0x000000).setStrokeStyle(4, 0x3a4878));
            const tela = this.add.rectangle(x, y, 104, 68, 0x0f3b52);
            p.add(tela);
            p.add(this.add.text(x, y, ['A B C', 'L E R', '0 1 1', 'O K !'][i], RD.UI.estilo(20, '#5ff0ff', { fontStyle: '700' })).setOrigin(0.5));
            const brilho = this.add.image(x, y, 'brilho').setTint(0x5ff0ff).setScale(1.3, 0.9).setAlpha(0.18).setBlendMode(Phaser.BlendModes.ADD);
            p.add(brilho);
            this.tweens.add({ targets: brilho, alpha: 0.3, duration: 1500 + i * 300, yoyo: true, repeat: -1 });
            p.add(this.add.rectangle(x, y + 52, 10, 20, 0x2a3458));
        });

        // cabos
        const cabos = this.add.graphics();
        cabos.lineStyle(5, 0x1a2242, 1);
        cabos.beginPath(); cabos.moveTo(150, 212); cabos.lineTo(330, 330); cabos.lineTo(440, 330); cabos.strokePath();
        cabos.beginPath(); cabos.moveTo(840, 228); cabos.lineTo(640, 330); cabos.lineTo(520, 330); cabos.strokePath();
        p.add(cabos);

        // cápsula de vidro com o Readapt
        const cx = W / 2, cy = 255;
        p.add(this.add.ellipse(cx, cy + 115, 220, 40, 0x1f2a50).setStrokeStyle(4, 0x3a4878));
        const luz = this.add.image(cx, cy, 'brilho').setTint(0x5ff0ff).setScale(2.4, 3).setAlpha(0.35).setBlendMode(Phaser.BlendModes.ADD);
        p.add(luz);
        this.tweens.add({ targets: luz, alpha: 0.5, duration: 1600, yoyo: true, repeat: -1 });
        const robo = this.add.image(cx, cy + 10, 'readapt').setScale(3.4);
        p.add(robo);
        this.tweens.add({ targets: robo, y: cy - 4, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        const vidro = this.add.graphics();
        vidro.fillStyle(0x9fe6ff, 0.12);
        vidro.fillRoundedRect(cx - 95, cy - 130, 190, 245, 60);
        vidro.lineStyle(5, 0x9fe6ff, 0.6);
        vidro.strokeRoundedRect(cx - 95, cy - 130, 190, 245, 60);
        vidro.fillStyle(0xffffff, 0.25);
        vidro.fillRect(cx - 70, cy - 100, 10, 120);
        p.add(vidro);
        p.add(this.add.rectangle(cx, cy - 140, 140, 24, 0x2a3458).setStrokeStyle(3, 0x3a4878));

        // bolhinhas subindo dentro da cápsula
        p.add(this.add.particles(0, 0, 'faisca', {
            x: { min: cx - 70, max: cx + 70 }, y: cy + 100, lifespan: 2400, speedY: { min: -60, max: -30 },
            scale: { start: 0.6, end: 0 }, alpha: { start: 0.7, end: 0 }, tint: 0x9fe6ff, frequency: 160, blendMode: 'ADD',
        }));
    }

    // PÁGINA 2: a mente da criança, com letras bagunçadas girando
    cenaMente(p) {
        const W = RD.LARGURA, A = this.ALTURA_PALCO;
        const g = this.add.graphics();
        g.fillGradientStyle(0x1a0b2a, 0x1a0b2a, 0x07040d, 0x07040d, 1);
        g.fillRect(0, 0, W, A);
        p.add(g);

        // sombras do medo chegando pelos lados
        [[0, 120], [W, 300], [80, 420], [W - 60, 60]].forEach(([x, y], i) => {
            const s = this.add.image(x, y, 'nevoa').setTint(0x000000).setAlpha(0.9).setScale(2.4);
            p.add(s);
            this.tweens.add({ targets: s, x: x + (x < W / 2 ? 90 : -90), duration: 3500 + i * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        });

        const cx = W / 2, cy = 250;
        const luz = this.add.image(cx, cy, 'brilho').setTint(0xffb36b).setScale(2.4).setAlpha(0.25).setBlendMode(Phaser.BlendModes.ADD);
        p.add(luz);
        p.add(this.add.image(cx, cy + 70, 'sombra').setScale(2.4));
        const crianca = this.add.image(cx, cy, 'crianca').setScale(3.6);
        p.add(crianca);
        this.tweens.add({ targets: crianca, angle: { from: -3, to: 3 }, duration: 700, yoyo: true, repeat: -1 });

        // anel de letras girando em volta (algumas viradas, como a dislexia faz)
        const anel = this.add.container(cx, cy);
        const letras = ['b', 'd', 'p', 'q', 'A', 'Я', 'E', 'Ǝ', 'S', 'Z', 'N', 'M'];
        letras.forEach((l, i) => {
            const a = (i / letras.length) * Math.PI * 2;
            const t = this.add.text(Math.cos(a) * 175, Math.sin(a) * 120, l, RD.UI.estilo(38, i % 3 === 0 ? '#ff4d6d' : '#e9e2d0', {
                fontStyle: '700', stroke: '#000000', strokeThickness: 6,
            })).setOrigin(0.5).setAngle(Phaser.Math.Between(-35, 35));
            anel.add(t);
            this.tweens.add({ targets: t, angle: t.angle + 360 * (i % 2 ? 1 : -1), duration: 6000 + i * 300, repeat: -1 });
        });
        p.add(anel);
        this.tweens.add({ targets: anel, angle: 360, duration: 24000, repeat: -1 });

        // pontos de interrogação flutuando
        [[200, 110], [760, 140], [260, 360], [720, 380]].forEach(([x, y], i) => {
            const q = this.add.text(x, y, '?', RD.UI.estilo(54, '#7a3cff', { fontStyle: '700', stroke: '#000000', strokeThickness: 6 })).setOrigin(0.5).setAlpha(0.6);
            p.add(q);
            this.tweens.add({ targets: q, y: y - 18, duration: 1500 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        });
    }

    // PÁGINA 3: o "porão" da mente visto em corte, com os três andares do jogo
    cenaAndares(p) {
        const W = RD.LARGURA;
        p.add(this.add.rectangle(W / 2, this.ALTURA_PALCO / 2, W, this.ALTURA_PALCO, 0x050408));
        const andares = [
            { id: 'letras', cor: '#9fb3ff' },
            { id: 'labirinto', cor: '#c49bff' },
            { id: 'nucleo', cor: '#ff7a8f' },
        ];
        const altura = 136, x0 = 40, largura = W - 80;
        andares.forEach((a, i) => {
            const y0 = 36 + i * 146, cy = y0 + altura / 2;
            const nome = RD.CENARIOS[i].nome;
            p.add(this.add.tileSprite(W / 2, cy, largura, altura, 'piso_' + a.id));
            p.add(this.add.tileSprite(W / 2, y0 + 12, largura, 24, 'parede_' + a.id));
            p.add(this.add.tileSprite(W / 2, y0 + altura - 6, largura, 12, 'parede_' + a.id));
            p.add(this.add.rectangle(W / 2, cy, largura, altura).setStrokeStyle(4, 0x000000));
            // nome do andar numa plaquinha
            p.add(this.add.text(x0 + 20, y0 + 34, (i + 1) + '. ' + nome, RD.UI.estilo(19, a.cor, {
                fontStyle: '700', stroke: '#000000', strokeThickness: 5,
            })));
        });

        // 1º andar: o Readapt anda, atira no monstrinho, ele some e o Readapt desce a escada
        const y1 = 36 + altura / 2 + 14;
        p.add(this.add.image(800, y1, 'escada_letras_esquerda').setScale(0.9));
        const monstro = this.add.image(500, y1 + 10, 'letra_torta');
        const robo = this.add.sprite(160, y1, 'readapt_direita').setScale(1.2);
        p.add([monstro, robo]);
        const vivo = () => robo.active && this.palco === p;
        const esperar = (ms, fn) => this.time.delayedCall(ms, () => { if (vivo()) fn(); });
        const ciclo = () => {
            if (!vivo()) return;
            robo.setPosition(160, y1).setAlpha(1).setScale(1.2).setTexture('readapt_direita');
            monstro.setAlpha(1).setScale(1).setAngle(0);
            robo.anims.play('andar_direita');
            // 1) anda até perto do monstrinho
            this.tweens.add({ targets: robo, x: 360, duration: 1700, onComplete: () => {
                if (!vivo()) return;
                robo.anims.stop(); robo.setTexture('readapt_direita');
                // 2) atira três vezes
                let tiros = 0;
                const atirar = () => {
                    if (!vivo()) return;
                    robo.anims.play('atirar_direita');
                    const t = this.add.image(robo.x + 22, robo.y + 8, 'pulso').setScale(0.8);
                    p.add(t);
                    this.tweens.add({ targets: t, x: monstro.x - 14, duration: 260, onComplete: () => {
                        t.destroy();
                        if (!vivo()) return;
                        const r = this.add.image(monstro.x - 12, monstro.y, 'respingo').setTint(0x9fe6ff).setScale(0.5);
                        p.add(r);
                        this.tweens.add({ targets: r, scale: 1.1, alpha: 0, duration: 220, onComplete: () => r.destroy() });
                        this.tweens.add({ targets: monstro, x: monstro.x + 4, duration: 60, yoyo: true });
                    } });
                    tiros++;
                    if (tiros < 3) esperar(320, atirar);
                    else esperar(500, () => {
                        // 3) o monstrinho é restaurado e some
                        this.tweens.add({ targets: monstro, alpha: 0, scale: 0.4, angle: 90, duration: 450 });
                        esperar(600, () => {
                            // 4) anda até a escada e desce
                            robo.anims.play('andar_direita');
                            this.tweens.add({ targets: robo, x: 795, duration: 2200, onComplete: () => {
                                if (!vivo()) return;
                                robo.anims.stop(); robo.setTexture('readapt_costas');
                                this.tweens.add({ targets: robo, y: y1 + 14, scale: 0.7, alpha: 0, duration: 700, ease: 'Quad.easeIn' });
                                esperar(1600, ciclo);
                            } });
                        });
                    });
                };
                atirar();
            } });
        };
        ciclo();

        // 2º andar: chega pela direita, a escada fica à esquerda
        const y2 = 36 + 146 + altura / 2 + 14;
        p.add(this.add.image(360, y2, 'escada_labirinto_direita').setScale(0.9));
        p.add(this.add.image(720, y2 + 6, 'criatura_confusao'));
        p.add(this.add.image(560, y2 + 10, 'palavra_embaralhada'));

        // 3º andar: a Dislexia prendendo a criança
        const y3 = 36 + 292 + altura / 2 + 10;
        const chefe = this.add.image(720, y3 - 8, 'chefe_dislexia').setScale(0.62);
        p.add(chefe);
        this.tweens.add({ targets: chefe, scale: 0.66, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        p.add(this.add.image(600, y3 + 18, 'crianca').setScale(1.1));

        // setinhas mostrando o caminho para baixo
        [[800, 36 + altura + 5], [360, 36 + 146 + altura + 5]].forEach(([x, y], i) => {
            const s = this.add.text(x, y, '▼', RD.UI.estilo(22, '#ffd23f', { stroke: '#000000', strokeThickness: 5 })).setOrigin(0.5);
            p.add(s);
            this.tweens.add({ targets: s, y: y + 5, duration: 700, yoyo: true, repeat: -1, delay: i * 300, ease: 'Sine.easeInOut' });
        });
    }

    // PÁGINA 4: a Dislexia prende a criança e o Readapt sobe da escada para salvar
    cenaMissao(p) {
        const W = RD.LARGURA, A = this.ALTURA_PALCO;
        const g = this.add.graphics();
        g.fillGradientStyle(0x220810, 0x220810, 0x050205, 0x050205, 1);
        g.fillRect(0, 0, W, A);
        p.add(g);
        p.add(this.add.tileSprite(W / 2, A - 60, W, 120, 'piso_nucleo').setAlpha(0.8));
        p.add(this.add.image(W / 2, A - 160, 'degrade_cima').setDisplaySize(W, 120).setOrigin(0.5, 0));

        // a Dislexia enorme à direita
        const chefe = this.add.image(690, 200, 'chefe_dislexia').setScale(1.9);
        p.add(chefe);
        this.tweens.add({ targets: chefe, scale: 2.0, y: 190, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        [[-18, -12], [18, -12]].forEach(([ox, oy]) => {
            const olho = this.add.image(690 + ox * 1.9, 200 + oy * 1.9, 'brilho').setTint(0xff2a2a).setScale(0.4).setBlendMode(Phaser.BlendModes.ADD);
            p.add(olho);
            this.tweens.add({ targets: olho, alpha: { from: 0.5, to: 1 }, duration: 900, yoyo: true, repeat: -1 });
        });

        // a criança presa por letras
        p.add(this.add.image(560, 400, 'sombra').setScale(1.8));
        p.add(this.add.image(560, 365, 'crianca').setScale(2.4));
        ['L', 'E', 'R'].forEach((l, i) => {
            p.add(this.add.text(528 + i * 32, 320 + (i % 2) * 12, l, RD.UI.estilo(34, '#ff4d6d', {
                fontStyle: '700', stroke: '#000000', strokeThickness: 6,
            })).setOrigin(0.5).setAngle((i - 1) * 25));
        });

        // o Readapt chegando pela escada do porão
        p.add(this.add.image(250, 392, 'escada_nucleo_baixo').setScale(1.5));
        p.add(this.add.particles(0, 0, 'faisca', {
            x: { min: 200, max: 300 }, y: { min: 360, max: 420 }, speedY: { min: -18, max: -8 },
            lifespan: 2200, frequency: 220, scale: { start: 0.5, end: 0.1 }, alpha: { start: 0.35, end: 0 }, tint: 0xffb3c1,
        }));
        const robo = this.add.image(250, 410, 'readapt_costas').setScale(2.2).setAlpha(0);
        p.add(robo);
        this.tweens.add({ targets: robo, y: 340, alpha: 1, scale: 3, duration: 1300, ease: 'Quad.easeOut', delay: 500,
            onComplete: () => {
                robo.setTexture('readapt_direita');
                this.tweens.add({ targets: robo, x: 360, y: 350, duration: 700, ease: 'Sine.easeOut' });
            } });
    }
};
