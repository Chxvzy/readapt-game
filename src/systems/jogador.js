// Movimento, tiro e dano do Readapt. Usado na cena do jogo e na do chefe.
RD.Jogador = {
    criar(cena, x, y) {
        const j = cena.physics.add.sprite(x, y, 'readapt').setDepth(7);
        j.body.setSize(26, 30).setOffset(11, 24); // a colisão fica na parte de baixo (corpo e pés)
        cena.direcao = 'frente';
        cena.olharAte = 0;
        cena.atirandoAte = 0;
        j.setCollideWorldBounds(true);
        RD.Efeitos.sombra(cena, j);
        cena.teclas = cena.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ENTER,ESC,M,Q,SPACE,ONE,TWO,THREE');
        // Impede que as setas e o espaço rolem a página
        cena.input.keyboard.addCapture('UP,DOWN,LEFT,RIGHT,SPACE');
        cena.ultimoTiro = 0;
        cena.invulAte = 0;
        cena.gTiros = cena.physics.add.group();
        cena.gTirosInim = cena.physics.add.group();
        return j;
    },

    mover(cena) {
        const t = cena.teclas;
        const j = cena.jogador;
        let vx = 0, vy = 0;
        if (t.A.isDown) vx -= 1;
        if (t.D.isDown) vx += 1;
        if (t.W.isDown) vy -= 1;
        if (t.S.isDown) vy += 1;
        const v = new Phaser.Math.Vector2(vx, vy).normalize().scale(RD.REGRAS.velocidadeJogador);
        j.setVelocity(v.x, v.y);
        // vira para onde anda (a não ser que tenha acabado de atirar para outro lado)
        if (cena.time.now > cena.olharAte) {
            if (vy < 0) cena.direcao = 'costas';
            else if (vy > 0) cena.direcao = 'frente';
            else if (vx < 0) cena.direcao = 'esquerda';
            else if (vx > 0) cena.direcao = 'direita';
        }
        // atirando: deixa a animação do tiro terminar
        if (cena.time.now < cena.atirandoAte) return;
        // andando: toca a animação; parado: mostra o desenho parado
        if (vx || vy) {
            j.anims.play('andar_' + cena.direcao, true);
        } else {
            if (j.anims.isPlaying) j.anims.stop();
            j.setTexture(RD.TEXTURA_PARADO[cena.direcao]);
        }
    },

    atirar(cena, tempo) {
        const t = cena.teclas;
        let dx = 0, dy = 0;
        if (t.LEFT.isDown) dx = -1;
        else if (t.RIGHT.isDown) dx = 1;
        else if (t.UP.isDown) dy = -1;
        else if (t.DOWN.isDown) dy = 1;
        if (!dx && !dy) return;
        if (tempo - cena.ultimoTiro < RD.REGRAS.intervaloTiro) return;
        cena.ultimoTiro = tempo;
        const j = cena.jogador;
        const forte = RD.Estado.tem('pulso_forte');
        // o tiro sai da mão (de lado) ou do peito (de frente e de costas)
        const sx = j.x + dx * 22, sy = j.y + (dx ? 8 : 10 + dy * 14);
        const tiro = cena.gTiros.create(sx, sy, 'pulso').setDepth(8);
        tiro.body.setCircle(9, 2, 2);
        tiro.dano = forte ? 2 : 1;
        if (forte) tiro.setScale(1.35).setTint(0xffe680);
        tiro.morreEm = tempo + RD.REGRAS.alcanceTiro;
        tiro.setVelocity(dx * RD.REGRAS.velocidadeTiro, dy * RD.REGRAS.velocidadeTiro);
        tiro.escalaBase = tiro.scale;
        RD.Efeitos.sombra(cena, tiro, 0.35, 20); // a gota "flutua" acima da sombra
        tiro.once('destroy', () => RD.Efeitos.respingo(cena, tiro.x, tiro.y, forte ? 0xffe680 : 0x9fe6ff));
        // olha para onde atirou (como a cabeça do Isaac)
        cena.direcao = dx < 0 ? 'esquerda' : dx > 0 ? 'direita' : dy < 0 ? 'costas' : 'frente';
        // animação de atirar + brilho rápido onde o tiro nasce
        j.anims.play('atirar_' + cena.direcao);
        cena.atirandoAte = tempo + 160;
        const luz = cena.add.image(sx, sy, 'brilho').setTint(forte ? 0xffe680 : 0x7fe8ff)
            .setBlendMode(Phaser.BlendModes.ADD).setScale(0.25).setAlpha(0.9).setDepth(9);
        cena.tweens.add({ targets: luz, scale: 0.5, alpha: 0, duration: 140, onComplete: () => luz.destroy() });
        if (cena.objSala) cena.objSala.push(luz); // some junto se trocar de sala
        cena.olharAte = tempo + 350;
        RD.Som.tocar('tiro');
    },

    // Remove tiros que já foram longe demais
    limparTiros(cena, tempo) {
        cena.gTiros.getChildren().slice().forEach((t) => {
            if (tempo > t.morreEm) t.destroy();
            else if (tempo > t.morreEm - 150) t.setScale(t.escalaBase * 0.8); // a gota "cai" no fim
        });
        cena.gTirosInim.getChildren().slice().forEach((t) => {
            if (t.x < -30 || t.x > RD.LARGURA + 30 || t.y < RD.TOPO - 30 || t.y > RD.ALTURA + 30) t.destroy();
        });
    },

    // Deixa o robô meio transparente enquanto está invulnerável (sem piscar)
    atualizarVisual(cena, tempo) {
        cena.jogador.setAlpha(tempo < cena.invulAte ? 0.45 : 1);
    },

    // Dano de inimigos. Retorna true se o jogador ficou sem vida.
    levarDano(cena, quantidade) {
        const tempo = cena.time.now;
        if (tempo < cena.invulAte) return false;
        RD.estado.vida = Math.max(0, RD.estado.vida - quantidade);
        cena.invulAte = tempo + RD.REGRAS.invulneravel;
        cena.cameras.main.shake(120, 0.004);
        RD.Som.tocar('dano');
        cena.hud.atualizarVida();
        return RD.estado.vida <= 0;
    },

    // Dano por erro em atividade: ensina, mas nunca derruba o jogador
    danoAtividade(cena) {
        if (RD.estado.vida > 1) RD.estado.vida -= 1;
        cena.hud.atualizarVida();
    },
};
