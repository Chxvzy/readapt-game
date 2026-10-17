// Telas de final no estilo do Isaac: uma página de diário sobre o porão,
// com desenho, texto, lista do que foi feito e um carimbo.
//   ruim       = perdeu toda a vida
//   normal     = derrotou o chefe
//   verdadeiro = derrotou o chefe, fez todas as atividades e achou as salas secretas
RD.CenaFim = class extends Phaser.Scene {
    constructor() { super('Fim'); }

    init(dados) { this.final = (dados && dados.final) || 'normal'; }

    create() {
        RD.camera(this);
        const W = RD.LARGURA, H = RD.ALTURA;
        const f = RD.TEXTOS.finais[this.final];
        const ruim = this.final === 'ruim';
        const verdadeiro = this.final === 'verdadeiro';
        const cenario = RD.CENARIOS[(RD.estado && RD.estado.cenario) || 0].id;

        // ---------- fundo: o porão do cenário ----------
        this.cameras.main.setBackgroundColor('#08080e');
        this.add.tileSprite(W / 2, H / 2, W, H, 'piso_' + (ruim ? cenario : 'letras'));
        this.add.image(W / 2, H / 2, 'detalhes_' + (ruim ? cenario : 'letras')).setDisplaySize(W, H);
        RD.UI.letrasFlutuando(this, 12, ruim ? '#ff4d6d' : '#ffe9a8', ruim ? 0.08 : 0.1, 1);
        this.add.image(W / 2, H / 2, 'vinheta_tela').setDepth(2);

        // ---------- a página de diário ----------
        const pagina = this.add.container(0, 0).setDepth(10);
        const papel = this.add.image(W / 2, H / 2 + 4, 'papel').setDisplaySize(830, 600);
        if (ruim) papel.setTint(0xd9ccb4);
        pagina.add(papel);

        const corTitulo = ruim ? '#a3241b' : verdadeiro ? '#9a6400' : '#1f4e8c';
        pagina.add(this.add.text(W / 2, 102, f.titulo, RD.UI.estilo(34, corTitulo, {
            fontStyle: '700', align: 'center', wordWrap: { width: 680 },
        })).setOrigin(0.5));
        // risco "à mão" embaixo do título
        const risco = this.add.graphics();
        risco.lineStyle(3, Phaser.Display.Color.HexStringToColor(corTitulo).color, 0.7);
        risco.beginPath(); risco.moveTo(W / 2 - 230, 130); risco.lineTo(W / 2 + 10, 134); risco.lineTo(W / 2 + 230, 129); risco.strokePath();
        pagina.add(risco);

        this.desenho(pagina, ruim, verdadeiro);

        pagina.add(this.add.text(W / 2, 338, f.texto, RD.UI.estilo(20, '#3b2f1e', {
            align: 'center', wordWrap: { width: 640 }, lineSpacing: 8, fontStyle: '600',
        })).setOrigin(0.5));

        this.listaFeitos(pagina);

        if (this.final === 'normal' && f.dica) {
            pagina.add(this.add.text(W / 2, 500, f.dica, RD.UI.estilo(16, '#7a5a2e', {
                align: 'center', wordWrap: { width: 620 }, fontStyle: '600',
            })).setOrigin(0.5));
        }

        // ---------- opções ----------
        const botoes = ruim
            ? [RD.UI.itemPapel(this, W / 2 - 160, 560, 'Tentar de novo', () => this.tentarDeNovo()),
                RD.UI.itemPapel(this, W / 2 + 175, 560, 'Menu', () => this.scene.start('Menu'))]
            : [RD.UI.itemPapel(this, W / 2 - 160, 560, 'Jogar de novo', () => { RD.Estado.comecar(); this.scene.start('Historia'); }),
                RD.UI.itemPapel(this, W / 2 + 175, 560, 'Menu', () => this.scene.start('Menu'))];
        botoes.forEach(b => { b.rotulo.setFontSize('28px'); b.mudarTexto(b.rotulo.text); pagina.add(b); });
        this.menu = RD.UI.menu(this, botoes);
        this.input.keyboard.on('keydown-LEFT', () => this.input.keyboard.emit('keydown-UP'));
        this.input.keyboard.on('keydown-RIGHT', () => this.input.keyboard.emit('keydown-DOWN'));
        this.input.keyboard.on('keydown-A', () => this.input.keyboard.emit('keydown-UP'));
        this.input.keyboard.on('keydown-D', () => this.input.keyboard.emit('keydown-DOWN'));
        this.events.once('shutdown', () => this.menu.destruir());

        // ---------- animação: a página cai na tela e depois vem o carimbo ----------
        pagina.y = -H;
        pagina.angle = -4;
        this.tweens.add({ targets: pagina, y: 0, angle: 0, duration: 700, ease: 'Back.easeOut', delay: 250 });
        this.time.delayedCall(1100, () => this.carimbo(ruim, verdadeiro));

        RD.Som.tocar(ruim ? 'derrota' : 'vitoria');
        this.cameras.main.fadeIn(700, 0, 0, 0);
    }

    // Desenho no meio da página
    desenho(pagina, ruim, verdadeiro) {
        const W = RD.LARGURA;
        const y = 222;
        const sombra = (x, esc) => pagina.add(this.add.image(x, y + 52, 'sombra').setScale(esc || 2).setAlpha(0.5));

        if (ruim) {
            // a Dislexia segura a criança atrás de grades; o Readapt caído
            pagina.add(this.add.image(W / 2 + 110, y - 4, 'chefe_dislexia').setScale(0.75).setAlpha(0.9));
            sombra(W / 2 + 110, 2.4);
            pagina.add(this.add.image(W / 2 + 110, y + 8, 'crianca').setScale(1.8));
            const grade = this.add.graphics();
            grade.lineStyle(5, 0x3b2f1e, 0.9);
            for (let i = -2; i <= 2; i++) grade.lineBetween(W / 2 + 110 + i * 14, y - 30, W / 2 + 110 + i * 14, y + 46);
            grade.lineBetween(W / 2 + 76, y - 30, W / 2 + 144, y - 30);
            grade.lineBetween(W / 2 + 76, y + 46, W / 2 + 144, y + 46);
            pagina.add(grade);
            sombra(W / 2 - 140, 2.2);
            pagina.add(this.add.image(W / 2 - 140, y + 12, 'readapt').setScale(2.2).setAngle(80).setAlpha(0.85));
            pagina.add(this.add.text(W / 2 - 100, y - 36, 'z z z', RD.UI.estilo(22, '#6b5a3e', { fontStyle: '700' })).setAngle(-10));
            return;
        }

        if (verdadeiro) {
            // raios de sol girando devagar atrás de todos
            const raios = this.add.graphics();
            raios.fillStyle(0xffc94d, 0.28);
            for (let i = 0; i < 12; i++) {
                const a = (i / 12) * Math.PI * 2;
                raios.fillTriangle(0, 0, Math.cos(a - 0.14) * 125, Math.sin(a - 0.14) * 125, Math.cos(a + 0.14) * 125, Math.sin(a + 0.14) * 125);
            }
            raios.setPosition(W / 2, y + 10);
            pagina.addAt(raios, 1); // atrás do título e dos personagens
            this.tweens.add({ targets: raios, angle: 360, duration: 30000, repeat: -1 });
            // a palavra restaurada no alto
            pagina.add(this.add.text(W / 2, y - 72, 'L E R', RD.UI.estilo(30, '#9a6400', { fontStyle: '700' })).setOrigin(0.5));
        }

        sombra(W / 2 - 90);
        sombra(W / 2 + 90);
        const robo = this.add.image(W / 2 - 90, y, 'readapt').setScale(2.4);
        const crianca = this.add.image(W / 2 + 90, y, 'crianca').setScale(2.4);
        pagina.add([robo, crianca]);
        this.tweens.add({ targets: robo, y: y - 12, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeOut' });
        this.tweens.add({ targets: crianca, y: y - 12, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeOut', delay: 250 });

        const coracao = this.add.image(W / 2, y - 30, 'coracao_cheio').setScale(1.1);
        pagina.add(coracao);
        this.tweens.add({ targets: coracao, scale: 1.3, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        if (verdadeiro) pagina.add(this.add.image(W / 2, y + 40, 'livro').setScale(1.2));
    }

    // Lista do que a pessoa fez, com ícones e marcação "de caneta"
    listaFeitos(pagina) {
        const r = RD.Estado.resumo();
        const W = RD.LARGURA;
        const itens = [
            { icone: RD.Arte.letra3D(this, 'A'), escala: 0.42 * RD.Arte.ESCALA_LETRA, texto: 'Atividades', feito: r.atividadesFeitas, total: r.atividades },
            { icone: 'porta_aberta', escala: 0.36, texto: 'Salas secretas', feito: r.segredosAchados, total: r.segredos },
            { icone: 'up_pulso', escala: 0.6, texto: 'Upgrades', feito: r.upgradesPegos, total: r.upgrades },
        ];
        itens.forEach((it, i) => {
            const x = W / 2 - 250 + i * 250;
            const y = 438;
            pagina.add(this.add.image(x - 70, y, it.icone).setScale(it.escala));
            
            pagina.add(this.add.text(x - 46, y - 12, it.texto, RD.UI.estilo(15, '#6b5a3e', { fontStyle: '600' })));
            const completo = it.feito >= it.total;
            pagina.add(this.add.text(x - 46, y + 6, it.feito + ' de ' + it.total + (completo ? '  ✔' : ''),
                RD.UI.estilo(19, completo ? '#2e7d32' : '#3b2f1e', { fontStyle: '700' })));
        });
    }

    // Carimbo que aparece por cima da página
    carimbo(ruim, verdadeiro) {
        const texto = ruim ? 'PRESA' : verdadeiro ? 'MUNDO SALVO' : 'SALVA!';
        const cor = ruim ? 0xb3261e : verdadeiro ? 0xb07a00 : 0x2e7d32;
        const corTxt = ruim ? '#b3261e' : verdadeiro ? '#b07a00' : '#2e7d32';
        const c = this.add.container(RD.LARGURA / 2 + 265, 222).setDepth(20).setAngle(-14);
        const t = this.add.text(0, 0, texto, RD.UI.estilo(verdadeiro ? 28 : 36, corTxt, { fontStyle: '700' })).setOrigin(0.5);
        const caixa = this.add.rectangle(0, 0, t.width + 34, t.height + 18).setStrokeStyle(5, cor, 0.9);
        c.add([caixa, t]);
        c.setAlpha(0).setScale(2.2);
        this.tweens.add({
            targets: c, alpha: 0.85, scale: 1, duration: 260, ease: 'Quad.easeIn',
            onComplete: () => this.cameras.main.shake(120, 0.003),
        });
    }

    // Volta para o começo do cenário (ou para o chefe) com a vida cheia
    tentarDeNovo() {
        RD.Estado.voltarCheckpoint();
        const e = RD.estado;
        const sala = e.sala && RD.CENARIOS[e.cenario].salas[e.sala];
        if (sala && sala.tipo === 'chefe') this.scene.start('Chefe');
        else this.scene.start('Jogo', { titulo: true });
    }
};
