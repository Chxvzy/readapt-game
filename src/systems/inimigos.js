// Comportamento dos inimigos (perseguir, atirar, pular) e o que acontece quando são atingidos.
RD.IA = {
    criar(cena, tipo, x, y, forca, atraso) {
        const def = RD.INIMIGOS[tipo];
        forca = forca || 1;
        const en = cena.gInimigos.create(x, y, def.textura).setDepth(6);
        const esc = (RD.Arte.escalas && RD.Arte.escalas[def.textura]) || 1;   // texturas feitas em dobro
        if (esc !== 1) en.setScale(esc);
        // colisão redonda (em pixels da textura; o Phaser aplica a escala sozinho)
        const tam = Math.min(en.width, en.height);
        en.body.setCircle(tam * 0.36, en.width / 2 - tam * 0.36, en.height / 2 - tam * 0.36 + 2 / esc);
        en.tipo = tipo;
        en.def = def;
        en.vida = Math.ceil(def.vida * forca);
        en.velocidade = def.velocidade * (1 + (forca - 1) / 3);
        en.ativoEm = cena.time.now + (atraso === undefined ? 700 : atraso);
        en.proximaAcao = en.ativoEm + Phaser.Math.Between(300, 1200);
        en.fase = Math.random() * 10;
        if (def.comportamento === 'atirar') en.body.setImmovable(true);
        RD.Efeitos.sombra(cena, en, en.displayWidth / 48);
        en.setAlpha(0);
        cena.tweens.add({ targets: en, alpha: 1, duration: 500 });
        return en;
    },

    atualizar(cena, tempo) {
        const j = cena.jogador;
        cena.gInimigos.getChildren().forEach((en) => {
            if (!en.active) return;
            if (tempo < en.ativoEm || (en.empurradoAte && tempo < en.empurradoAte)) {
                if (tempo < en.ativoEm) en.setVelocity(0, 0);
                return;
            }
            switch (en.def.comportamento) {
                case 'perseguir': {
                    cena.physics.moveToObject(en, j, en.velocidade);
                    if (en.tipo === 'letra_torta') en.setAngle(Math.sin(tempo / 200 + en.fase) * 12);
                    break;
                }
                case 'atirar': {
                    en.setVelocity(0, 0);
                    if (tempo > en.proximaAcao) {
                        en.proximaAcao = tempo + en.def.intervaloTiro * Phaser.Math.FloatBetween(0.8, 1.2);
                        this.atirarEm(cena, en.x, en.y + 10, j.x, j.y, en.def.velocidadeTiro);
                    }
                    break;
                }
                case 'pular': {
                    if (tempo > en.proximaAcao) {
                        en.proximaAcao = tempo + en.def.intervaloPulo * Phaser.Math.FloatBetween(0.7, 1.3);
                        // às vezes vai na direção do jogador, às vezes para um lugar qualquer
                        const alvoX = Math.random() < 0.5 ? j.x + Phaser.Math.Between(-80, 80) : Phaser.Math.Between(100, RD.LARGURA - 100);
                        const alvoY = Math.random() < 0.5 ? j.y + Phaser.Math.Between(-80, 80) : Phaser.Math.Between(RD.TOPO + 100, RD.ALTURA - 100);
                        cena.physics.moveTo(en, alvoX, alvoY, en.velocidade);
                        en.paraEm = tempo + 520;
                    } else if (en.paraEm && tempo > en.paraEm) {
                        en.setVelocity(en.body.velocity.x * 0.9, en.body.velocity.y * 0.9);
                    }
                    en.setAngle(Math.sin(tempo / 300 + en.fase) * 8);
                    break;
                }
            }
        });
    },

    atirarEm(cena, x, y, alvoX, alvoY, velocidade) {
        const t = cena.gTirosInim.create(x, y, 'letra_tiro').setDepth(55); // acima da escuridão
        t.body.setCircle(10, 3, 3);
        cena.physics.moveTo(t, alvoX, alvoY, velocidade);
        t.once('destroy', () => RD.Efeitos.respingo(cena, t.x, t.y, 0xff6b6b));
        return t;
    },

    // Tiro do jogador acertou um inimigo
    acertar(cena, tiro, en) {
        if (!tiro.active || !en.active) return;
        const dano = tiro.dano || 1;
        const vx = tiro.body.velocity.x, vy = tiro.body.velocity.y;
        tiro.destroy();
        en.vida -= dano;
        RD.Som.tocar('acerto');
        en.setTint(0xffa0a0);
        cena.time.delayedCall(90, () => { if (en.active) en.clearTint(); });
        if (en.def.comportamento !== 'atirar') {
            const v = new Phaser.Math.Vector2(vx, vy).normalize().scale(160);
            en.setVelocity(v.x, v.y);
            en.empurradoAte = cena.time.now + 110;
        }
        if (en.vida <= 0) this.derrotar(cena, en);
    },

    derrotar(cena, en) {
        const x = en.x, y = en.y;
        RD.Som.tocar('restaurar');
        RD.Efeitos.mancha(cena, x, y, en.def.corTinta || 0xffffff);
        // a letra "restaurada" sobe e some
        const letras = 'ABCDEFGHIJLMNOPRSTUVZ';
        const t = cena.add.text(x, y, letras[Math.floor(Math.random() * letras.length)],
            RD.UI.estilo(30, '#ffffff', { fontStyle: '700', stroke: '#2463eb', strokeThickness: 5 }))
            .setOrigin(0.5).setDepth(9);
        cena.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 700, onComplete: () => t.destroy() });

        if (en.def.divideEm) {
            [-20, 20].forEach((dx) => this.criar(cena, en.def.divideEm, x + dx, y, 1, 250));
        }
        // às vezes deixa meio coração
        if (cena.gItens && RD.estado.vida < RD.estado.vidaMax && Math.random() < RD.REGRAS.chanceCoracao) {
            const c = cena.gItens.create(x, y, 'coracao_meio').setDepth(4);
            c.cura = 1;
        }
        en.destroy();
    },
};
