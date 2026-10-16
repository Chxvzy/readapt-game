// Barra de cima: corações, upgrades, tarefa da sala e mini-mapa.
RD.Hud = class {
    constructor(cena) {
        this.cena = cena;
        this.c = cena.add.container(0, 0).setDepth(100);
        const fundo = cena.add.rectangle(RD.LARGURA / 2, RD.TOPO / 2, RD.LARGURA, RD.TOPO, 0x08080e);
        const linha = cena.add.rectangle(RD.LARGURA / 2, RD.TOPO - 2, RD.LARGURA, 4, 0x1c1c2a);
        this.c.add([fundo, linha]);

        this.coracoes = [];
        this.icones = [];
        this.titulo = cena.add.text(RD.LARGURA / 2 + 10, 26, '', RD.UI.estilo(26, '#ffffff', { fontStyle: '600' })).setOrigin(0.5);
        this.subtitulo = cena.add.text(RD.LARGURA / 2 + 10, 60, '', RD.UI.estilo(16, '#cfe0ff')).setOrigin(0.5);
        this.mapa = cena.add.graphics();
        this.c.add([this.titulo, this.subtitulo, this.mapa]);

        this.atualizarVida();
        this.atualizarUpgrades();
    }

    atualizarVida() {
        this.coracoes.forEach(c => c.destroy());
        this.coracoes = [];
        const e = RD.estado;
        const total = Math.ceil(e.vidaMax / 2);
        for (let i = 0; i < total; i++) {
            const resto = Phaser.Math.Clamp(e.vida - i * 2, 0, 2);
            const tex = resto === 2 ? 'coracao_cheio' : resto === 1 ? 'coracao_meio' : 'coracao_vazio';
            const img = this.cena.add.image(18 + i * 40, 24, tex).setOrigin(0, 0.5);
            this.c.add(img);
            this.coracoes.push(img);
        }
    }

    atualizarUpgrades() {
        this.icones.forEach(c => c.destroy());
        this.icones = [];
        RD.estado.upgrades.forEach((id, i) => {
            const up = RD.UPGRADES[id];
            if (!up) return;
            const img = this.cena.add.image(30 + i * 34, 60, up.textura).setScale(0.6);
            this.c.add(img);
            this.icones.push(img);
        });
    }

    setTarefa(titulo, subtitulo, tamanho) {
        this.titulo.setText(titulo || '');
        this.titulo.setFontSize((tamanho || 26) + 'px');
        this.subtitulo.setText(subtitulo || '');
    }

    // Mini-mapa no canto direito (salas visitadas e vizinhas)
    atualizarMapa(indiceCenario, salaAtual) {
        const g = this.mapa;
        g.clear();
        const cen = RD.CENARIOS[indiceCenario];
        const e = RD.estado;
        const chaves = Object.keys(cen.salas);
        const xs = chaves.map(k => +k.split(',')[0]);
        const ys = chaves.map(k => +k.split(',')[1]);
        const minX = Math.min.apply(null, xs), minY = Math.min.apply(null, ys);
        const maxY = Math.max.apply(null, ys);
        const larg = 20, alt = 12, gap = 3;
        const altTotal = (maxY - minY + 1) * (alt + gap);
        const x0 = RD.LARGURA - 18 - (Math.max.apply(null, xs) - minX + 1) * (larg + gap);
        const y0 = Math.max(6, (RD.TOPO - altTotal) / 2);

        const conhecida = (k) => {
            const d = cen.salas[k];
            const kk = RD.Estado.chave(indiceCenario, k);
            if (d.tipo === 'secreta') return !!e.segredos[kk];
            if (e.visitadas[kk]) return true;
            const [x, y] = k.split(',').map(Number);
            return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => e.visitadas[RD.Estado.chave(indiceCenario, (x + dx) + ',' + (y + dy))]);
        };

        chaves.forEach((k) => {
            if (!conhecida(k)) return;
            const [x, y] = k.split(',').map(Number);
            const kk = RD.Estado.chave(indiceCenario, k);
            const d = cen.salas[k];
            let cor = e.visitadas[kk] ? 0x9fb3d1 : 0x3a3f5c;
            if (d.tipo === 'chefe') cor = 0xe63946;
            if (d.tipo === 'passagem' && e.visitadas[kk]) cor = 0x7a3cff;
            if (k === salaAtual) cor = 0xffd23f;
            const px = x0 + (x - minX) * (larg + gap);
            const py = y0 + (y - minY) * (alt + gap);
            g.fillStyle(cor, 1);
            g.fillRect(px, py, larg, alt);
            if (d.atividade && !e.atividades[kk] && k !== salaAtual) {
                g.fillStyle(0xffffff, 1);
                g.fillRect(px + 8, py + 4, 4, 4);
            }
        });
    }

    // Barra de vida do chefe no lugar da tarefa
    barraChefe(nome) {
        this.setTarefa('', '');
        this.nomeChefe = this.cena.add.text(RD.LARGURA / 2, 20, nome, RD.UI.estilo(20, '#ff9ab0', { fontStyle: '700' })).setOrigin(0.5);
        this.barraFundo = this.cena.add.rectangle(RD.LARGURA / 2, 52, 420, 22, 0x14142b).setStrokeStyle(3, 0xffffff);
        this.barra = this.cena.add.rectangle(RD.LARGURA / 2 - 207, 52, 414, 16, 0xe63946).setOrigin(0, 0.5);
        this.c.add([this.nomeChefe, this.barraFundo, this.barra]);
    }

    atualizarChefe(fracao) {
        if (this.barra) this.barra.width = 414 * Phaser.Math.Clamp(fracao, 0, 1);
    }
};
