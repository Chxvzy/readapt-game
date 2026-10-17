// Peças de interface reaproveitadas em várias telas: textos, botões, avisos.
RD.UI = {
    // Estilo de texto padrão (fonte legível e grande)
    // A OpenDyslexic é bem mais larga que as fontes comuns: todo tamanho pedido
    // é reduzido um pouco para os textos caberem nos mesmos lugares de antes.
    ESCALA_FONTE: 0.78,
    estilo(tamanho, cor, extra) {
        return Object.assign({
            fontFamily: RD.FONTE,
            fontSize: Math.round((tamanho || 24) * RD.UI.ESCALA_FONTE) + 'px',
            color: cor || '#ffffff',
            resolution: 2,
            lineSpacing: 8,
        }, extra || {});
    },

    // Diminui a letra de um texto até ele caber no espaço (largura x altura)
    encaixar(t, maxL, maxA, minimo) {
        let tam = parseInt(t.style.fontSize, 10) || 16;
        if (maxL) t.setWordWrapWidth(maxL);
        while ((t.width > maxL || (maxA && t.height > maxA)) && tam > (minimo || 8)) {
            tam -= 1;
            t.setFontSize(tam + 'px');
        }
        return t;
    },

    // Botão com fundo, que funciona com mouse e teclado (via RD.UI.menu)
    botao(cena, x, y, texto, acao, largura) {
        largura = largura || 300;
        const c = cena.add.container(x, y);
        const fundo = cena.add.rectangle(0, 0, largura, 60, 0x2a3050).setStrokeStyle(3, 0x08080e);
        const sombra = cena.add.rectangle(0, 6, largura, 60, 0x08080e);
        const rotulo = cena.add.text(0, 0, texto, RD.UI.estilo(24, '#ffffff', { fontStyle: '600' })).setOrigin(0.5);
        c.add([sombra, fundo, rotulo]);
        c.setSize(largura, 60);
        c.setInteractive({ useHandCursor: true });
        c.fundo = fundo;
        c.rotulo = rotulo;
        c.acao = acao;
        c.selecionar = (sim) => {
            fundo.setFillStyle(sim ? 0xffd23f : 0x2a3050);
            rotulo.setColor(sim ? '#14142b' : '#ffffff');
        };
        return c;
    },

    // Opção escrita "à mão" no papel do menu, com uma setinha quando selecionada
    itemPapel(cena, x, y, texto, acao) {
        const c = cena.add.container(x, y);
        const rotulo = cena.add.text(0, 0, texto, RD.UI.estilo(34, '#3b2f1e', { fontStyle: '700' })).setOrigin(0.5);
        const seta = cena.add.text(-rotulo.width / 2 - 26, 0, '▶', RD.UI.estilo(26, '#a3241b')).setOrigin(0.5);
        c.add([seta, rotulo]);
        c.setSize(rotulo.width + 80, 52);
        c.setInteractive({ useHandCursor: true });
        c.rotulo = rotulo;
        c.acao = acao;
        c.selecionar = (sim) => {
            seta.setVisible(sim);
            rotulo.setColor(sim ? '#a3241b' : '#3b2f1e');
            c.setScale(sim ? 1.08 : 1);
        };
        c.mudarTexto = (t) => {
            rotulo.setText(t);
            seta.setX(-rotulo.width / 2 - 26);
        };
        return c;
    },

    // Tecla desenhada (para as telas de explicação)
    tecla(cena, x, y, rotulo, largura) {
        largura = largura || 46;
        const c = cena.add.container(x, y);
        const base = cena.add.rectangle(0, 5, largura, 44, 0x0a0a12).setStrokeStyle(3, 0x000000);
        const topo = cena.add.rectangle(0, 0, largura - 6, 38, 0x3a3f5c).setStrokeStyle(2, 0x5a6185);
        const txt = cena.add.text(0, 0, rotulo, RD.UI.estilo(rotulo.length > 2 ? 15 : 20, '#ffffff', { fontStyle: '700' })).setOrigin(0.5);
        c.add([base, topo, txt]);
        return c;
    },

    // Opção de menu só com texto (estilo Gungeon/Isaac), com setinha quando selecionada
    itemMenu(cena, x, y, texto, acao) {
        const c = cena.add.container(x, y);
        const seta = cena.add.text(-8, 0, '▶', RD.UI.estilo(24, '#ffd23f', { stroke: '#000000', strokeThickness: 5 })).setOrigin(1, 0.5);
        const rotulo = cena.add.text(0, 0, texto, RD.UI.estilo(32, '#e9e2d0', {
            fontStyle: '700', stroke: '#000000', strokeThickness: 7,
        })).setOrigin(0, 0.5);
        c.add([seta, rotulo]);
        c.setSize(rotulo.width * 2 + 40, 50);
        c.setInteractive({ useHandCursor: true });
        c.rotulo = rotulo;
        c.acao = acao;
        c.baseX = x;
        c.selecionar = (sim) => {
            seta.setVisible(sim);
            rotulo.setColor(sim ? '#ffd23f' : '#e9e2d0');
            cena.tweens.add({ targets: c, x: c.baseX + (sim ? 22 : 0), duration: 120 });
        };
        c.mudarTexto = (t) => rotulo.setText(t);
        return c;
    },

    // Lista de botões navegável por setas/WS + Enter, e pelo mouse
    menu(cena, botoes) {
        let sel = 0;
        const atualizar = () => botoes.forEach((b, i) => b.selecionar(i === sel));
        botoes.forEach((b, i) => {
            b.on('pointerover', () => { sel = i; atualizar(); });
            b.on('pointerdown', () => { RD.Som.tocar('menu'); b.acao(); });
        });
        const teclado = cena.input.keyboard;
        const mover = (d) => { sel = (sel + d + botoes.length) % botoes.length; RD.Som.tocar('menu'); atualizar(); };
        const ativar = () => { RD.Som.tocar('menu'); botoes[sel].acao(); };
        const handlers = {
            'keydown-UP': () => mover(-1), 'keydown-W': () => mover(-1),
            'keydown-DOWN': () => mover(1), 'keydown-S': () => mover(1),
            'keydown-ENTER': ativar, 'keydown-SPACE': ativar,
        };
        Object.keys(handlers).forEach(k => teclado.on(k, handlers[k]));
        atualizar();
        return {
            // desliga o teclado e o mouse desta lista
            destruir() {
                Object.keys(handlers).forEach(k => teclado.off(k, handlers[k]));
                botoes.forEach((b) => { if (b.active) b.off('pointerover').off('pointerdown'); });
            },
        };
    },

    // Aviso curto na parte de baixo da sala, que some sozinho
    aviso(cena, texto, duracao) {
        if (cena._aviso) { cena._aviso.destroy(); cena._aviso = null; }
        const t = cena.add.text(0, 0, texto, RD.UI.estilo(22, '#ffffff', {
            align: 'center', wordWrap: { width: 780 },
        })).setOrigin(0.5);
        RD.UI.encaixar(t, 780, 120, 12);
        const fundo = cena.add.rectangle(0, 0, t.width + 44, t.height + 24, 0x0d1024, 0.9)
            .setStrokeStyle(3, 0xffd23f);
        // a caixa cresce para cima: a borda de baixo fica sempre dentro da tela
        const c = cena.add.container(RD.LARGURA / 2, RD.ALTURA - 20 - (t.height + 24) / 2, [fundo, t]).setDepth(150);
        cena._aviso = c;
        cena.time.delayedCall(duracao || 2600, () => {
            if (cena._aviso !== c) return;
            cena.tweens.add({
                targets: c, alpha: 0, duration: 400,
                onComplete: () => { c.destroy(); if (cena._aviso === c) cena._aviso = null; },
            });
        });
        return c;
    },

    // Letras flutuando devagar no fundo (decoração)
    letrasFlutuando(cena, quantidade, cor, alfa, profundidade) {
        const letras = 'ABCEFGHIJKLMNORSTUVXZ';
        const lista = [];
        for (let i = 0; i < quantidade; i++) {
            const l = letras[Math.floor(Math.random() * letras.length)];
            const x = Phaser.Math.Between(40, RD.LARGURA - 40);
            const y = Phaser.Math.Between(RD.TOPO + 40, RD.ALTURA - 40);
            const t = cena.add.text(x, y, l, RD.UI.estilo(Phaser.Math.Between(26, 44), cor, { fontStyle: '700' }))
                .setOrigin(0.5).setAlpha(alfa).setAngle(Phaser.Math.Between(-25, 25)).setDepth(profundidade || 1);
            cena.tweens.add({
                targets: t,
                y: y - Phaser.Math.Between(20, 50),
                angle: t.angle + Phaser.Math.Between(-15, 15),
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            });
            lista.push(t);
        }
        return lista;
    },

    // Tela de pausa simples
    pausa(cena) {
        const c = cena.add.container(0, 0).setDepth(300);
        const fundo = cena.add.rectangle(RD.LARGURA / 2, RD.ALTURA / 2, RD.LARGURA, RD.ALTURA, 0x0d1024, 0.94);
        const titulo = cena.add.text(RD.LARGURA / 2, 200, 'Pausado', RD.UI.estilo(48, '#ffd23f', { fontStyle: '700' })).setOrigin(0.5);
        const somTxt = cena.add.text(RD.LARGURA / 2, 300, '', RD.UI.estilo(24)).setOrigin(0.5);
        const dicas = cena.add.text(RD.LARGURA / 2, 400,
            'Esc: continuar\nM: ligar ou desligar o som\nQ: voltar ao menu',
            RD.UI.estilo(24, '#cfe0ff', { align: 'center' })).setOrigin(0.5);
        c.add([fundo, titulo, somTxt, dicas]);
        c.atualizarSom = () => somTxt.setText('Som: ' + (RD.Som.ligado ? 'ligado' : 'desligado'));
        c.atualizarSom();
        return c;
    },
};

