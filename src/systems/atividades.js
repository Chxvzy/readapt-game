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
        this.blocos.forEach((b) => { b.texto.destroy(); b.destroy(); });
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
            r.palavra.split('').forEach((letra, i) => this.criarBloco(pontos[i].x, pontos[i].y, letra, 'bloco_letra', 42));
        } else {
            const opcoes = Phaser.Utils.Array.Shuffle(r.opcoes.slice());
            const xs = [240, 480, 720];
            opcoes.forEach((o, i) => this.criarBloco(xs[i], RD.CENTRO_Y + 40, o, 'bloco_silaba', 38));
        }
        this.atualizarHud();
    }

    criarBloco(x, y, valor, textura, tamanho) {
        const b = this.cena.gBlocos.create(x, y, textura).setDepth(5);
        b.valor = valor;
        b.texto = this.cena.add.text(x, y - 3, valor, RD.UI.estilo(tamanho, '#14142b', { fontStyle: '700' }))
            .setOrigin(0.5).setDepth(6);
        this.blocos.push(b);
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
            this.cena.tweens.add({ targets: [bloco, bloco.texto], x: '+=6', duration: 50, yoyo: true, repeat: 3 });
            if (this.def.tipo === 'silaba') {
                bloco.usado = true;
                bloco.setTint(0x8a8aa0);
                bloco.texto.setColor('#6b6b80');
            }
            if (RD.Estado.tem('escaneamento')) {
                this.destacarCerto(RD.TEXTOS.feedback.escaneamento);
            } else if (this.errosRodada >= RD.REGRAS.errosAteDica) {
                this.destacarCerto(RD.TEXTOS.feedback.dicaErros);
            }
        }
    }

    sumirBloco(bloco) {
        this.cena.physics.world.disable(bloco); // deixa de ser sólido
        this.cena.tweens.add({
            targets: [bloco, bloco.texto], scale: 1.3, alpha: 0, duration: 300,
            onComplete: () => { bloco.setVisible(false); bloco.texto.setVisible(false); },
        });
    }

    // Mostra a resposta certa com uma moldura amarela (sem piscar)
    destacarCerto(mensagem) {
        this.limparDestaques();
        const certa = this.respostaCerta();
        const alvo = this.blocos.find(b => !b.usado && b.valor === certa);
        if (!alvo) return;
        const g = this.cena.add.rectangle(alvo.x, alvo.y, alvo.width + 16, alvo.height + 16)
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
        this.cena.hud.setTarefa(r.dica + '   ' + mostra + contador, instrucao, 32);
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
