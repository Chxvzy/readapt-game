// Atividades educativas: palavra embaralhada e sílaba que falta.
RD.Atividade = class {
    constructor(cena, def) {
        this.cena = cena;
        this.def = def;
        this.rodada = 0;
        this.concluida = false;
        this.blocos = [];
        this.destaques = [];
        this.iniciarRodada();
    }

    get r() { return this.def.rodadas[this.rodada]; }

    palavraInteira() {
        return this.def.tipo === 'palavra' ? this.r.palavra : this.r.partes.join('');
    }

    limparBlocos() {
        this.blocos.forEach((b) => {
            const chave = b.texture.key;
            b.texto.destroy(); b.brilho.destroy(); b.sombraChao.destroy(); b.destroy();
            if (this.cena.textures.exists(chave)) this.cena.textures.remove(chave); // cada letra tem a sua textura
        });
        this.blocos = [];
        this.destaques.forEach(d => d.destroy());
        this.destaques = [];
    }

    // Lugares livres para espalhar as letras (longe das portas)
    pontosLivres() {
        const pontos = [];
        [3, 5, 7, 12, 14, 16].forEach((col) => {
            [3, 6, 9].forEach((lin) => pontos.push(RD.posTile(col, lin)));
        });
        pontos.push(RD.posTile(10, 3), RD.posTile(10, 8));
        return pontos;
    }

    iniciarRodada() {
        this.limparBlocos();
        this.pos = 0;
        this.errosRodada = 0;
        this.resolvida = false;
        const r = this.r;
        if (this.def.tipo === 'palavra') {
            const pontos = Phaser.Utils.Array.Shuffle(this.pontosLivres());
            r.palavra.split('').forEach((letra, i) => this.criarBloco(pontos[i].x, pontos[i].y, letra));
        } else {
            const opcoes = Phaser.Utils.Array.Shuffle(r.opcoes.slice());
            const xs = [240, 480, 720];
            opcoes.forEach((o, i) => this.criarBloco(xs[i], RD.CENTRO_Y + 40, o));
        }
        this.atualizarHud();
    }

    criarBloco(x, y, valor) {
        const cena = this.cena;
        // a letra (ou sílaba) é o próprio objeto no chão
        const b = cena.gBlocos.create(x, y, RD.Arte.letra3D(cena, valor, true)).setDepth(5);
        b.setScale(RD.Arte.ESCALA_LETRA).refreshBody();
        b.body.setSize(b.displayWidth * 0.8, b.displayHeight * 0.7, true);
        b.valor = valor;
        b.texto = cena.add.text(x, y, '', RD.UI.estilo(10)).setVisible(false); // (compatibilidade)
        b.brilho = cena.add.image(x, y, 'sombra').setVisible(false);          // (compatibilidade)
        // sombra parada no chão
        b.sombraChao = cena.add.image(x, y + b.displayHeight * 0.36, 'sombra').setDepth(4)
            .setScale(valor.length > 1 ? 1.9 : 1.1, 0.9);
        this.blocos.push(b);
        // aparece "caindo" no chão, com um quique
        const e = RD.Arte.ESCALA_LETRA;
        b.setScale(e, e * 0.2).setAlpha(0);
        cena.tweens.add({ targets: b, scaleY: e, alpha: 1, duration: 260, ease: 'Back.easeOut', delay: this.blocos.length * 70 });
        return b;
    }

    respostaCerta() {
        const r = this.r;
        return this.def.tipo === 'palavra' ? r.palavra[this.pos] : r.partes[r.falta];
    }

    // Um tiro acertou um bloco
    tentar(bloco) {
        if (this.concluida || this.resolvida || bloco.usado) return;
        const certo = bloco.valor === this.respostaCerta();
        if (certo) {
            RD.Som.tocar('certo');
            bloco.usado = true;
            this.limparDestaques();
            this.errosRodada = 0;
            if (this.def.tipo === 'palavra') {
                this.pos++;
                this.sumirBloco(bloco);
                if (this.pos >= this.r.palavra.length) this.fimRodada();
            } else {
                this.resolvida = true;
                bloco.setTint(0xa8f0b0);
                this.fimRodada();
            }
            this.atualizarHud();
        } else {
            RD.Som.tocar('erro');
            this.errosRodada++;
            RD.Jogador.danoAtividade(this.cena);
            const msgs = RD.TEXTOS.feedback.erro;
            RD.UI.aviso(this.cena, msgs[Math.floor(Math.random() * msgs.length)], 1800);
            this.cena.tweens.add({ targets: bloco, x: '+=6', duration: 50, yoyo: true, repeat: 3 });
            if (this.def.tipo === 'silaba') {
                bloco.usado = true;
                bloco.setTint(0x6a6a80);
            }
            if (RD.Estado.tem('escaneamento')) {
                this.destacarCerto(RD.TEXTOS.feedback.escaneamento);
            } else if (this.errosRodada >= RD.REGRAS.errosAteDica) {
                this.destacarCerto(RD.TEXTOS.feedback.dicaErros);
            }
        }
    }

    // Letra certa: ela se quebra em pedacinhos (como as pedras do Isaac)
    sumirBloco(bloco) {
        const cena = this.cena;
        cena.physics.world.disable(bloco); // deixa de ser sólido
        for (let i = 0; i < 9; i++) {
            const t = 4 + Math.floor(Math.random() * 5);
            const caco = cena.add.rectangle(bloco.x + Phaser.Math.Between(-14, 14), bloco.y + Phaser.Math.Between(-14, 10),
                t, t, i % 3 ? 0xe8dcc0 : 0x7a6a50).setStrokeStyle(2, 0x0b0912).setDepth(6);
            cena.tweens.add({
                targets: caco, x: caco.x + Phaser.Math.Between(-40, 40), y: caco.y + Phaser.Math.Between(-30, 25),
                angle: Phaser.Math.Between(-180, 180), alpha: 0, duration: 450, ease: 'Quad.easeOut',
                onComplete: () => caco.destroy(),
            });
        }
        bloco.setVisible(false);
        bloco.sombraChao.setVisible(false);
    }

    // Mostra a resposta certa com uma moldura amarela (sem piscar)
    destacarCerto(mensagem) {
        this.limparDestaques();
        const certa = this.respostaCerta();
        const alvo = this.blocos.find(b => !b.usado && b.valor === certa);
        if (!alvo) return;
        const g = this.cena.add.rectangle(alvo.x, alvo.y, alvo.displayWidth + 16, alvo.displayHeight + 16)
            .setStrokeStyle(5, 0xffd23f).setDepth(6);
        this.destaques.push(g);
        if (mensagem) this.cena.time.delayedCall(1900, () => RD.UI.aviso(this.cena, mensagem, 1800));
        this.cena.time.delayedCall(2600, () => { if (g.active) g.destroy(); });
    }

    limparDestaques() {
        this.destaques.forEach(d => d.destroy());
        this.destaques = [];
    }

    fimRodada() {
        const palavra = this.palavraInteira();
        const elogios = RD.TEXTOS.feedback.acerto;
        RD.UI.aviso(this.cena, elogios[Math.floor(Math.random() * elogios.length)] + ' Você formou ' + palavra + '!', 1800);
        RD.Som.falar(palavra);
        this.cena.time.delayedCall(1500, () => {
            if (!this.cena || this.destruida) return;
            this.rodada++;
            if (this.rodada >= this.def.rodadas.length) {
                this.concluida = true;
                this.limparBlocos();
                this.cena.atividadeConcluida();
            } else {
                this.iniciarRodada();
            }
        });
    }

    atualizarHud() {
        const r = this.r;
        let mostra;
        if (this.def.tipo === 'palavra') {
            mostra = r.palavra.split('').map((l, i) => (i < this.pos ? l : '_')).join(' ');
        } else {
            mostra = r.partes.map((p, i) => (i === r.falta && !this.resolvida ? '__' : p)).join(' ');
        }
        const n = this.def.rodadas.length;
        const contador = n > 1 ? '   (' + (this.rodada + 1) + ' de ' + n + ')' : '';
        const instrucao = this.def.tipo === 'palavra'
            ? 'Atire nas letras na ordem certa  •  E: ouvir a palavra'
            : 'Atire na sílaba que completa a palavra  •  E: ouvir a palavra';
        this.cena.hud.setTarefa((r.dica ? r.dica + '   ' : '') + mostra + contador, instrucao, 32);
    }

    ouvir() {
        if (!RD.Som.falar(this.palavraInteira())) {
            RD.UI.aviso(this.cena, RD.Som.ligado ? 'Seu navegador não tem voz disponível.' : 'Ligue o som (tecla M) para ouvir.', 2000);
        }
    }

    destruir() {
        this.destruida = true;
        this.limparBlocos();
    }
};
