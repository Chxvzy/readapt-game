// Luta final contra a entidade da Dislexia.
// Ela tem um escudo roxo: o jogador encosta no livro brilhante, responde uma
// pergunta de leitura e, se acertar, o escudo estoura por alguns segundos.
RD.CenaChefe = class extends Phaser.Scene {
    constructor() { super('Chefe'); }

    create() {
        RD.camera(this);
        const e = RD.estado;
        RD.Estado.salvarCheckpoint(); // "Tentar de novo" volta direto para o chefe

        this.trocando = false;
        this.pausado = false;
        this.pergunta = null;
        this.vulneravelAte = 0;
        this.fase = 1;
        this._aviso = null;
        this.livro = null;
        this.avisouEscudo = false;

        this.physics.world.setBounds(0, RD.TOPO, RD.LARGURA, RD.LINHAS * RD.TILE);

        // Sala
        RD.Efeitos.fundoSala(this, 'nucleo');
        RD.UI.letrasFlutuando(this, 10, '#ff4d6d', 0.12, 1);
        this.gParedes = this.physics.add.staticGroup();
        for (let col = 0; col < RD.COLS; col++) {
            for (let lin = 0; lin < RD.LINHAS; lin++) {
                if (col === 0 || lin === 0 || col === RD.COLS - 1 || lin === RD.LINHAS - 1) {
                    const p = RD.posTile(col, lin);
                    this.gParedes.create(p.x, p.y, 'parede_nucleo').setDepth(2);
                }
            }
        }

        // A porta por onde o Readapt entrou se fecha atrás dele: não tem como fugir
        const porta = this.add.image(RD.CENTRO_X, RD.ALTURA - RD.TILE / 2, 'porta_chefe').setAngle(180).setDepth(46);
        this.time.delayedCall(700, () => {
            porta.setTexture('porta_chefe_trancada');
            RD.Som.tocar('chefe');
            this.cameras.main.shake(220, 0.006);
        });

        // Personagens
        this.jogador = RD.Jogador.criar(this, RD.CENTRO_X, RD.ALTURA - 110);
        this.gInimigos = this.physics.add.group();
        this.gItens = null;
        this.hud = new RD.Hud(this);
        this.hud.barraChefe(RD.TEXTOS.chefe.nome);

        this.chefe = this.physics.add.sprite(RD.CENTRO_X, RD.TOPO + 175, 'chefe_dislexia').setDepth(52).setScale(1.25); // acima da escuridão para ficar sempre visível
        // hitbox no formato da nuvem de letras (o corpo, sem as pontas)
        this.chefe.body.setSize(150, 112).setOffset(9, 30);
        this.chefe.body.setImmovable(true);
        RD.Efeitos.sombra(this, this.chefe, 3).setDepth(5);
        this.escudo = this.criarEscudo();
        this.tweens.add({ targets: this.chefe, x: { from: 300, to: 660 }, duration: 4200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        // Vida do chefe: atividades extras deixam ele mais fraco
        const r = RD.Estado.resumo();
        this.vidaMax = 100;
        this.vida = Math.max(70, 100 - r.extrasFeitos * 10);

        this.escuro = this.add.image(this.jogador.x, this.jogador.y, 'escuro_chefe').setDepth(50).setAlpha(0.7);

        // Colisões
        this.physics.add.collider(this.jogador, this.gParedes);
        this.physics.add.collider(this.gInimigos, this.gParedes);
        this.physics.add.collider(this.gInimigos, this.gInimigos);
        this.physics.add.collider(this.gTiros, this.gParedes, (t) => t.destroy());
        this.physics.add.collider(this.gTirosInim, this.gParedes, (t) => t.destroy());
        this.physics.add.overlap(this.gTiros, this.gInimigos, (t, en) => RD.IA.acertar(this, t, en));
        this.physics.add.overlap(this.gTiros, this.chefe, (c, t) => this.acertarChefe(t));
        this.physics.add.overlap(this.jogador, this.gTirosInim, (j, t) => { t.destroy(); this.danoJogador(1); });
        this.physics.add.overlap(this.jogador, this.gInimigos, (j, en) => { if (this.time.now > en.ativoEm) this.danoJogador(1); });
        this.physics.add.overlap(this.jogador, this.chefe, () => this.danoJogador(2));

        this.proximoAtaque = this.time.now + 2500;
        this.proximaInvocacao = 0;
        this.ordemPerguntas = Phaser.Utils.Array.Shuffle(RD.PERGUNTAS_CHEFE.slice());
        this.indicePergunta = 0;

        this.atualizarBarra();
        this.cameras.main.fadeIn(600, 0, 0, 0);
        RD.Som.tocar('chefe');
        RD.UI.aviso(this, RD.TEXTOS.chefe.entrada, 4200);
        if (r.extrasFeitos > 0) {
            this.time.delayedCall(4500, () => RD.UI.aviso(this, RD.TEXTOS.chefe.bonus.replace('{n}', r.extrasFeitos), 3200));
        }
        this.time.delayedCall(1500, () => this.criarLivro());
    }

    // Escudo: só um círculo roxo em volta da Dislexia, pulsando devagar.
    // Quando a criança acerta a pergunta, ele estoura como uma bolha.
    criarEscudo() {
        const c = this.add.container(this.chefe.x, this.chefe.y + 12).setDepth(53);
        const raio = 125;
        const circulo = this.add.circle(0, 0, raio, 0x7a3cff, 0.12).setStrokeStyle(5, 0x9b6bff, 0.85);
        c.add(circulo);
        c.raio = raio;
        this.tweens.add({ targets: c, scale: 1.04, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        return c;
    }

    // (mantido para o update; o escudo simples não precisa girar)
    girarEscudo() { }

    // Animação de estourar: o círculo incha, some, solta uma onda e gotinhas roxas
    quebrarEscudo() {
        const e = this.escudo;
        const x = e.x, y = e.y, r = e.raio;
        this.tweens.killTweensOf(e);
        RD.Som.tocar('restaurar');
        // 1) incha rapidinho
        this.tweens.add({
            targets: e, scale: 1.15, duration: 120, ease: 'Quad.easeOut',
            onComplete: () => {
                e.setVisible(false).setScale(1).setAlpha(1);
                // 2) onda que se espalha
                const onda = this.add.circle(x, y, r).setStrokeStyle(6, 0xc9a0ff, 0.9).setDepth(54);
                this.tweens.add({ targets: onda, scale: 1.6, alpha: 0, duration: 450, ease: 'Quad.easeOut', onComplete: () => onda.destroy() });
                // 3) gotinhas da bolha voando para fora
                for (let i = 0; i < 18; i++) {
                    const a = (i / 18) * Math.PI * 2 + Math.random() * 0.2;
                    const gota = this.add.circle(x + Math.cos(a) * r, y + Math.sin(a) * r, Phaser.Math.Between(4, 8), 0x9b6bff, 0.9).setDepth(54);
                    const dist = Phaser.Math.Between(50, 110);
                    this.tweens.add({
                        targets: gota, x: gota.x + Math.cos(a) * dist, y: gota.y + Math.sin(a) * dist + 20,
                        scale: 0.2, alpha: 0, duration: Phaser.Math.Between(450, 700), ease: 'Quad.easeOut',
                        onComplete: () => gota.destroy(),
                    });
                }
            },
        });
    }

    voltarEscudo() {
        const e = this.escudo;
        e.setVisible(true).setScale(0.5).setAlpha(0);
        this.tweens.add({
            targets: e, scale: 1, alpha: 1, duration: 450, ease: 'Back.easeOut',
            onComplete: () => this.tweens.add({ targets: e, scale: 1.04, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }),
        });
    }

    atualizarBarra() {
        this.hud.atualizarChefe(this.vida / this.vidaMax);
    }

    // ------------------------------------------------------------------
    // LIVRO E PERGUNTAS
    // ------------------------------------------------------------------

    criarLivro() {
        if (this.livro || this.trocando || this.vida <= 0) return;
        const lugares = [[170, 420], [790, 420], [300, 560], [660, 560], [480, 470], [140, 560], [820, 560]];
        const livres = lugares.filter(([x, y]) => Phaser.Math.Distance.Between(x, y, this.jogador.x, this.jogador.y) > 140);
        const [x, y] = Phaser.Utils.Array.GetRandom(livres.length ? livres : lugares);
        this.livro = this.physics.add.staticImage(x, y, 'livro').setDepth(51);
        this.livroBob = this.tweens.add({ targets: this.livro, scale: 1.12, duration: 700, yoyo: true, repeat: -1 });
        this.livroOverlap = this.physics.add.overlap(this.jogador, this.livro, () => this.abrirPergunta());
    }

    removerLivro() {
        if (!this.livro) return;
        this.physics.world.removeCollider(this.livroOverlap);
        if (this.livroBob) this.livroBob.remove();
        this.livro.destroy();
        this.livro = null;
    }

    abrirPergunta() {
        if (this.pergunta || this.trocando) return;
        this.removerLivro();
        if (this._aviso) { this._aviso.destroy(); this._aviso = null; }
        const q = this.ordemPerguntas[this.indicePergunta % this.ordemPerguntas.length];
        this.indicePergunta++;
        const certa = q.opcoes[0];
        const opcoes = Phaser.Utils.Array.Shuffle(q.opcoes.slice());

        this.physics.pause();
        this.tweens.pauseAll();
        this.jogador.setVelocity(0, 0);

        const c = this.add.container(0, 0).setDepth(220);
        const fundo = this.add.rectangle(RD.CENTRO_X, RD.CENTRO_Y, RD.LARGURA, RD.LINHAS * RD.TILE, 0x0d1024, 0.8);
        const painel = this.add.image(RD.CENTRO_X, RD.CENTRO_Y, 'papel').setDisplaySize(800, 470);
        const titulo = this.add.text(RD.CENTRO_X, RD.CENTRO_Y - 175, q.pergunta, RD.UI.estilo(28, '#a3241b', { fontStyle: '700' })).setOrigin(0.5);
        const dica = q.dica
            ? this.add.text(RD.CENTRO_X, RD.CENTRO_Y - 100, q.dica, RD.UI.estilo(64)).setOrigin(0.5)
            : this.add.text(RD.CENTRO_X, RD.CENTRO_Y - 110, 'Aperte E para ouvir a palavra', RD.UI.estilo(22, '#6b5a3e', { fontStyle: '600' })).setOrigin(0.5);
        c.add([fundo, painel, titulo, dica]);
        if (q.texto) c.add(this.add.text(RD.CENTRO_X, RD.CENTRO_Y - 20, q.texto, RD.UI.estilo(40, '#3b2f1e', { fontStyle: '700' })).setOrigin(0.5));

        const botoes = opcoes.map((op, i) => {
            const x = RD.CENTRO_X + (i - 1) * 240;
            const y = RD.CENTRO_Y + 90;
            const b = this.add.container(x, y);
            const caixa = this.add.rectangle(0, 0, 210, 84, 0xfff8e1).setStrokeStyle(4, 0x14142b);
            const txt = this.add.text(0, -2, op, RD.UI.estilo(op.length > 6 ? 26 : 34, '#14142b', { fontStyle: '700' })).setOrigin(0.5);
            const num = this.add.text(-92, -36, String(i + 1), RD.UI.estilo(16, '#2463eb', { fontStyle: '700' }));
            b.add([caixa, txt, num]);
            b.setSize(210, 84).setInteractive({ useHandCursor: true });
            b.valor = op;
            b.caixa = caixa;
            b.on('pointerover', () => this.selecionarOpcao(i));
            b.on('pointerdown', () => this.responder(i));
            c.add(b);
            return b;
        });
        const ajuda = this.add.text(RD.CENTRO_X, RD.CENTRO_Y + 180, 'Teclas 1, 2 ou 3  •  Setas + Enter  •  E: ouvir', RD.UI.estilo(18, '#6b5a3e', { fontStyle: '600' })).setOrigin(0.5);
        c.add(ajuda);

        this.pergunta = { c, botoes, certa, sel: 0, palavra: q.texto ? q.texto.replace(/[ _]/g, '') + certa : certa, respondida: false };
        this.selecionarOpcao(0);
    }

    selecionarOpcao(i) {
        const p = this.pergunta;
        if (!p || p.respondida) return;
        p.sel = i;
        p.botoes.forEach((b, j) => b.caixa.setFillStyle(j === i ? 0xffd23f : 0xfff8e1));
    }

    responder(i) {
        const p = this.pergunta;
        if (!p || p.respondida) return;
        p.respondida = true;
        const b = p.botoes[i];
        const certo = b.valor === p.certa;
        b.caixa.setFillStyle(certo ? 0xa8f0b0 : 0xffb3b3);
        if (certo) {
            RD.Som.tocar('certo');
            RD.Som.falar(p.palavra);
        } else {
            RD.Som.tocar('erro');
            RD.Jogador.danoAtividade(this);
            const alvo = p.botoes.find(x => x.valor === p.certa);
            if (alvo) alvo.caixa.setStrokeStyle(6, 0x3fbf5f);
        }
        const msg = certo ? RD.TEXTOS.feedback.acerto : RD.TEXTOS.feedback.erro;
        const t = this.add.text(RD.CENTRO_X, RD.CENTRO_Y + 150, msg[Math.floor(Math.random() * msg.length)],
            RD.UI.estilo(26, certo ? '#2e7d32' : '#a3241b', { fontStyle: '700' })).setOrigin(0.5);
        p.c.add(t);
        this.time.delayedCall(certo ? 1100 : 1800, () => this.fecharPergunta(certo));
    }

    fecharPergunta(certo) {
        if (!this.pergunta) return;
        this.pergunta.c.destroy();
        this.pergunta = null;
        this.physics.resume();
        this.tweens.resumeAll();
        if (certo) {
            this.vulneravelAte = this.time.now + 7000;
            this.quebrarEscudo();
            this.chefe.setTint(0xffc2d1);
            this.danoChefe(12);
            RD.UI.aviso(this, RD.TEXTOS.chefe.fraca, 2200);
            this.time.delayedCall(7000, () => {
                if (this.vida <= 0 || this.trocando) return;
                this.voltarEscudo();
                this.chefe.clearTint();
                this.time.delayedCall(1200, () => this.criarLivro());
            });
        } else {
            this.time.delayedCall(1500, () => this.criarLivro());
        }
    }

    ouvirPergunta() {
        if (this.pergunta && !RD.Som.falar(this.pergunta.palavra.length > 0 ? this.pergunta.palavra : '')) {
            RD.UI.aviso(this, 'Ligue o som (tecla M) para ouvir.', 1600);
        }
    }

    // ------------------------------------------------------------------
    // DANO NO CHEFE
    // ------------------------------------------------------------------

    acertarChefe(tiro) {
        if (!tiro.active) return;
        tiro.destroy();
        if (this.time.now > this.vulneravelAte) {
            RD.Som.tocar('bloqueado');
            if (!this.avisouEscudo) {
                this.avisouEscudo = true;
                RD.UI.aviso(this, RD.TEXTOS.chefe.escudo, 2600);
            }
            return;
        }
        RD.Som.tocar('acerto');
        this.danoChefe(tiro.dano || 1);
    }

    danoChefe(qtd) {
        if (this.vida <= 0) return;
        this.vida = Math.max(0, this.vida - qtd);
        this.atualizarBarra();
        const fracao = this.vida / this.vidaMax;
        if (this.fase === 1 && fracao <= 0.66) {
            this.fase = 2;
            RD.UI.aviso(this, RD.TEXTOS.chefe.fase2, 2400);
        } else if (this.fase === 2 && fracao <= 0.33) {
            this.fase = 3;
            RD.UI.aviso(this, RD.TEXTOS.chefe.fase3, 2400);
        }
        if (this.vida <= 0) this.vencer();
    }

    // ------------------------------------------------------------------
    // ATAQUES
    // ------------------------------------------------------------------

    atacar(tempo) {
        if (tempo > this.proximoAtaque) {
            const quantos = this.fase === 3 ? 12 : 8;
            const vel = this.fase === 3 ? 165 : 130;
            const giro = Math.random() * Math.PI;
            for (let i = 0; i < quantos; i++) {
                const a = giro + (i / quantos) * Math.PI * 2;
                RD.IA.atirarEm(this, this.chefe.x, this.chefe.y, this.chefe.x + Math.cos(a) * 100, this.chefe.y + Math.sin(a) * 100, vel);
            }
            if (this.fase === 3) {
                this.time.delayedCall(450, () => {
                    if (this.trocando || this.pergunta || this.vida <= 0) return;
                    [-0.25, 0, 0.25].forEach((d) => {
                        const ang = Phaser.Math.Angle.Between(this.chefe.x, this.chefe.y, this.jogador.x, this.jogador.y) + d;
                        RD.IA.atirarEm(this, this.chefe.x, this.chefe.y, this.chefe.x + Math.cos(ang) * 100, this.chefe.y + Math.sin(ang) * 100, 190);
                    });
                });
            }
            this.proximoAtaque = tempo + (this.fase === 1 ? 2800 : this.fase === 2 ? 2500 : 1900);
        }
        if (this.fase >= 2 && tempo > this.proximaInvocacao) {
            this.proximaInvocacao = tempo + 8000;
            if (this.gInimigos.countActive(true) < 2) {
                [-120, 120].forEach((dx) => RD.IA.criar(this, 'letra_torta', this.chefe.x + dx, this.chefe.y + 110, 1.3, 600));
            }
        }
    }

    // ------------------------------------------------------------------
    // FIM DA LUTA
    // ------------------------------------------------------------------

    vencer() {
        this.trocando = true;
        this.removerLivro();
        this.tweens.killAll();
        this.gTirosInim.clear(true, true);
        this.gInimigos.clear(true, true);
        this.escudo.setVisible(false);
        this.jogador.setVelocity(0, 0);
        RD.Som.tocar('vitoria');
        RD.UI.aviso(this, RD.TEXTOS.chefe.derrota, 3000);
        this.tweens.add({ targets: this.escuro, alpha: 0, duration: 1500 });
        this.tweens.add({ targets: this.chefe, scale: 0, angle: 540, alpha: 0, duration: 2200, ease: 'Sine.easeIn' });
        this.time.delayedCall(3200, () => {
            RD.estado.chefeDerrotado = true;
            const final = RD.Estado.finalVitoria();
            this.cameras.main.fadeOut(800, 255, 255, 255);
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Fim', { final }));
        });
    }

    danoJogador(qtd) {
        if (this.trocando || this.pergunta) return;
        if (RD.Jogador.levarDano(this, qtd)) {
            this.trocando = true;
            this.physics.pause();
            RD.Som.tocar('derrota');
            this.cameras.main.fadeOut(900, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Fim', { final: 'ruim' }));
        }
    }

    alternarPausa() {
        if (this.pausado) {
            this.pausado = false;
            this.telaPausa.destroy();
            this.physics.resume();
            this.tweens.resumeAll();
        } else {
            this.pausado = true;
            this.physics.pause();
            this.tweens.pauseAll();
            this.telaPausa = RD.UI.pausa(this);
        }
    }

    update(tempo, delta) {
        if (this.trocando) return;
        const J = Phaser.Input.Keyboard.JustDown;
        const t = this.teclas;

        if (J(t.M)) {
            RD.Som.alternar();
            if (this.pausado) this.telaPausa.atualizarSom();
        }

        if (this.pergunta) {
            const p = this.pergunta;
            if (J(t.ONE)) this.responder(0);
            else if (J(t.TWO)) this.responder(1);
            else if (J(t.THREE)) this.responder(2);
            else if (J(t.LEFT) || J(t.A)) this.selecionarOpcao((p.sel + 2) % 3);
            else if (J(t.RIGHT) || J(t.D)) this.selecionarOpcao((p.sel + 1) % 3);
            else if (J(t.ENTER) || J(t.SPACE)) this.responder(p.sel);
            else if (J(t.E)) this.ouvirPergunta();
            return;
        }

        if (J(t.ESC)) this.alternarPausa();
        if (this.pausado) {
            if (J(t.Q)) this.scene.start('Menu');
            return;
        }

        RD.Jogador.mover(this);
        RD.Jogador.atirar(this, tempo);
        RD.Jogador.limparTiros(this, tempo);
        RD.Jogador.atualizarVisual(this, tempo);
        RD.IA.atualizar(this, tempo);
        this.atacar(tempo);

        RD.Efeitos.atualizar(this);
        this.girarEscudo(delta);
        this.escudo.setPosition(this.chefe.x, this.chefe.y + 12);
        this.escuro.setPosition(this.jogador.x, this.jogador.y);
    }
};
