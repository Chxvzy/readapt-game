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

    // Piso, detalhes do chão e sombra das bordas de uma sala
    fundoSala(cena, idCenario, lista) {
        const altura = RD.LINHAS * RD.TILE;
        const objs = [
            cena.add.tileSprite(RD.CENTRO_X, RD.CENTRO_Y, RD.LARGURA, altura, 'piso_' + idCenario).setDepth(0),
            cena.add.image(RD.CENTRO_X, RD.CENTRO_Y, 'detalhes_' + idCenario).setDepth(0.5),
            cena.add.image(RD.CENTRO_X, RD.CENTRO_Y, 'vinheta').setDepth(45),
        ];
        if (lista) lista.push(...objs);
        return objs;
    },
};
