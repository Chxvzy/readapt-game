// Efeitos visuais no estilo Binding of Isaac: sombras, respingos e manchas.
RD.Efeitos = {
    // Coloca uma sombra no chão embaixo de um sprite (ela some junto com ele)
    sombra(cena, alvo, escala, ajusteY) {
        const s = cena.add.image(alvo.x, alvo.y, 'sombra').setDepth(4).setScale(escala || 1);
        s.alvo = alvo;
        s.ajusteY = ajusteY !== undefined ? ajusteY : alvo.displayHeight * 0.42;
        cena.sombras = cena.sombras || [];
        cena.sombras.push(s);
        alvo.once('destroy', () => { if (s.active) s.destroy(); });
        return s;
    },

    // Faz as sombras acompanharem os sprites
    atualizar(cena) {
        if (!cena.sombras) return;
        cena.sombras = cena.sombras.filter((s) => {
            if (!s.active || !s.alvo || !s.alvo.active) { if (s.active) s.destroy(); return false; }
            s.setPosition(s.alvo.x, s.alvo.y + s.ajusteY);
            s.setVisible(s.alvo.visible);
            s.setAlpha(s.alvo.alpha);
            return true;
        });
    },

    // A cena está rodando? (evita criar efeitos enquanto a tela troca)
    ativa(cena) {
        return cena.sys && cena.sys.settings.status === Phaser.Scenes.RUNNING && !cena.limpando;
    },

    // Respingo quando um tiro bate em algo
    respingo(cena, x, y, cor) {
        if (!this.ativa(cena)) return;
        const r = cena.add.image(x, y, 'respingo').setDepth(9).setTint(cor).setScale(0.5);
        cena.tweens.add({ targets: r, scale: 1.1, alpha: 0, duration: 220, onComplete: () => r.destroy() });
    },

    // Mancha de tinta no chão quando um inimigo é derrotado
    mancha(cena, x, y, cor) {
        if (!this.ativa(cena)) return;
        const m = cena.add.image(x, y + 10, 'mancha').setDepth(1).setTint(cor)
            .setAlpha(0.5).setAngle(Phaser.Math.Between(0, 359)).setScale(Phaser.Math.FloatBetween(0.7, 1.1));
        if (cena.objSala) cena.objSala.push(m);
        return m;
    },

    // Portal animado: brilho, redemoinho girando, anel de pedra com runas e faíscas sendo puxadas
    portal(cena, x, y, escala, lista) {
        escala = escala || 1;
        const brilho = cena.add.image(x, y, 'brilho').setTint(0x7a3cff).setScale(2.4 * escala)
            .setAlpha(0.45).setBlendMode(Phaser.BlendModes.ADD).setDepth(2);
        const vortice = cena.add.image(x, y, 'portal_vortice').setScale(escala).setDepth(2.5);
        const aro = cena.add.image(x, y, 'portal').setScale(escala).setDepth(3);
        cena.tweens.add({ targets: brilho, alpha: 0.7, scale: 2.7 * escala, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        cena.tweens.add({ targets: vortice, angle: -360, duration: 2600, repeat: -1 });
        cena.tweens.add({ targets: aro, angle: 360, duration: 22000, repeat: -1 });
        const faiscas = cena.add.particles(0, 0, 'faisca', {
            emitZone: { type: 'edge', source: new Phaser.Geom.Circle(x, y, 95 * escala), quantity: 40 },
            moveToX: x, moveToY: y, lifespan: 1100,
            scale: { start: 0.9 * escala, end: 0.1 }, alpha: { start: 0.9, end: 0.2 },
            tint: [0x5ff0ff, 0x7a3cff, 0xffffff], frequency: 70, blendMode: 'ADD',
        }).setDepth(2.8);
        const objs = [brilho, vortice, aro, faiscas];
        if (lista) lista.push(...objs);
        return { brilho, vortice, aro, faiscas };
    },

    // Piso, detalhes do chão e sombra das bordas de uma sala.
    // Com "chaveSala", cada sala ganha rachaduras/manchas diferentes.
    fundoSala(cena, idCenario, lista, chaveSala) {
        const altura = RD.LINHAS * RD.TILE;
        let detalhes = 'detalhes_' + idCenario;
        let semente = 0;
        if (chaveSala) {
            const nome = idCenario + '|' + chaveSala;
            for (let i = 0; i < nome.length; i++) semente = (semente * 31 + nome.charCodeAt(i)) >>> 0;
            detalhes = 'detalhes_' + idCenario + '_' + chaveSala.replace(/[^a-z0-9]/gi, '_');
            if (!cena.textures.exists(detalhes)) {
                const t = cena.textures.createCanvas(detalhes, RD.LARGURA, altura);
                RD.Arte.desenharDetalhes(t.getContext(), RD.LARGURA, altura, idCenario, semente || 1);
                t.refresh();
            }
        }
        const piso = cena.add.tileSprite(RD.CENTRO_X, RD.CENTRO_Y, RD.LARGURA, altura, 'piso_' + idCenario).setDepth(0);
        if (chaveSala) { piso.tilePositionX = (semente % 4) * 48; piso.tilePositionY = ((semente >> 3) % 4) * 48; }
        const objs = [
            piso,
            cena.add.image(RD.CENTRO_X, RD.CENTRO_Y, detalhes).setDepth(0.5),
            cena.add.image(RD.CENTRO_X, RD.CENTRO_Y, 'vinheta').setDepth(45),
        ];
        if (lista) lista.push(...objs);
        return objs;
    },
};
