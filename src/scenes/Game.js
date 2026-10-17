// Cena principal: salas, portas, inimigos, atividades, itens e personagens.
RD.CenaJogo = class extends Phaser.Scene {
    constructor() { super('Jogo'); }

    init(dados) { this.dadosInicio = dados || {}; }

    create() {
        RD.camera(this);
        const e = RD.estado;
        this.cen = RD.CENARIOS[e.cenario];
        this.objSala = [];
        this.portas = [];
        this.trocando = false;
        this.pausado = false;
        this.dialogo = null;
        this.atividade = null;
        this.escuro = null;
        this.podeTrocarEm = 0;
        this._aviso = null;

        this.physics.world.setBounds(0, RD.TOPO, RD.LARGURA, RD.LINHAS * RD.TILE);

        // Grupos (cada sala coloca suas coisas aqui)
        this.gParedes = this.physics.add.staticGroup();
        this.gObst = this.physics.add.staticGroup();
        this.gPortasFechadas = this.physics.add.staticGroup();
        this.gPortasAbertas = this.physics.add.staticGroup();
        this.gRachadas = this.physics.add.staticGroup();
        this.gBlocos = this.physics.add.staticGroup();
        this.gNpcs = this.physics.add.staticGroup();
        this.gItens = this.physics.add.staticGroup();
        this.gPortal = this.physics.add.staticGroup();
        this.gInimigos = this.physics.add.group();

        this.jogador = RD.Jogador.criar(this, RD.CENTRO_X, RD.CENTRO_Y);
        this.hud = new RD.Hud(this);
        this.criarColisoes();

        this.montarSala(e.sala || this.cen.inicio, null);
        this.cameras.main.fadeIn(300, 13, 16, 36);
        if (this.dadosInicio.titulo) this.mostrarTitulo();
    }

    criarColisoes() {
        const solidos = [this.gParedes, this.gObst, this.gPortasFechadas, this.gRachadas, this.gBlocos, this.gNpcs];
        solidos.forEach((g) => {
            this.physics.add.collider(this.jogador, g);
            this.physics.add.collider(this.gInimigos, g);
            this.physics.add.collider(this.gTirosInim, g, (t) => t.destroy());
        });
        this.physics.add.collider(this.gInimigos, this.gInimigos);

        [this.gParedes, this.gObst, this.gPortasFechadas, this.gNpcs].forEach((g) => {
            this.physics.add.collider(this.gTiros, g, (t) => t.destroy());
        });
        this.physics.add.collider(this.gTiros, this.gRachadas, (t, r) => this.acertarRachada(t, r));
        this.physics.add.overlap(this.gTiros, this.gBlocos, (t, b) => {
            if (!t.active) return;
            t.destroy();
            if (this.atividade) this.atividade.tentar(b);
        });
        this.physics.add.overlap(this.gTiros, this.gInimigos, (t, en) => RD.IA.acertar(this, t, en));
        this.physics.add.overlap(this.jogador, this.gTirosInim, (j, t) => { t.destroy(); this.danoJogador(1); });
        this.physics.add.overlap(this.jogador, this.gInimigos, (j, en) => {
            if (this.time.now > en.ativoEm) this.danoJogador(1);
        });
        this.physics.add.overlap(this.jogador, this.gItens, (j, item) => this.pegarItem(item));
        this.physics.add.overlap(this.jogador, this.gPortasAbertas, (j, z) => this.passarPorta(z));
        this.physics.add.overlap(this.jogador, this.gPortal, () => this.proximoCenario());
    }

    // ------------------------------------------------------------------
    // MONTAR E LIMPAR SALAS
    // ------------------------------------------------------------------

    limparSala() {
        this.limpando = true;
        this.tweens.killAll();
        if (this.atividade) { this.atividade.destruir(); this.atividade = null; }
        [this.gParedes, this.gObst, this.gPortasFechadas, this.gPortasAbertas, this.gRachadas,
            this.gBlocos, this.gNpcs, this.gItens, this.gPortal, this.gInimigos, this.gTiros, this.gTirosInim]
            .forEach(g => g.clear(true, true));
        this.objSala.forEach(o => o.destroy());
        this.objSala = [];
        this.portas = [];
        if (this.escuro) { this.escuro.destroy(); this.escuro = null; }
        if (this._aviso) { this._aviso.destroy(); this._aviso = null; }
        if (this.objTitulo) { this.objTitulo.destroy(); this.objTitulo = null; }
        this.npcPerto = null;
        this.limpando = false;
    }

    montarSala(chave, entrada) {
        this.limparSala();
        const e = RD.estado;
        const d = this.cen.salas[chave];
        const k = RD.Estado.chave(e.cenario, chave);
        e.sala = chave;
        e.visitadas[k] = true;
        this.salaChave = chave;
        this.salaK = k;
        this.salaDef = d;

        if (d.tipo === 'secreta') e.segredos[k] = true;

        const temInimigos = !!(d.mapa && d.mapa.some(l => /[LSPC]/.test(l)));
        const temAtividade = !!(d.atividade && !e.atividades[k]);
        this.salaLimpa = !!e.limpas[k] || (!temInimigos && !temAtividade);

        // Piso, detalhes do chão e sombra das bordas (estilo porão)
        RD.Efeitos.fundoSala(this, this.cen.id, this.objSala, chave);
        if (this.cen.letrasFundo) {
            const f = this.cen.letrasFundo;
            this.objSala.push(...RD.UI.letrasFlutuando(this, f.quantidade, f.cor, f.alfa, 1));
        }

        this.criarParedesEPortas(chave, d);
        this.entradaSala = entrada;
        this.criarConteudo(d, k);
        this.posicionarJogador(entrada);

        // Escuridão no Núcleo (some quando a sala é limpa)
        if (this.cen.escuro && !this.salaLimpa && d.tipo === 'combate') {
            this.escuro = this.add.image(this.jogador.x, this.jogador.y, 'escuro_sala').setDepth(50);
        }

        this.atualizarTextoSala();
        this.hud.atualizarMapa(e.cenario, chave);
        this.podeTrocarEm = this.time.now + 350;
    }

    criarParedesEPortas(chave, d) {
        const e = RD.estado;
        const [cx, cy] = chave.split(',').map(Number);
        const vizinhos = {
            cima: (cx) + ',' + (cy - 1),
            baixo: (cx) + ',' + (cy + 1),
            esquerda: (cx - 1) + ',' + (cy),
            direita: (cx + 1) + ',' + (cy),
        };
        const portaEm = {};
        Object.keys(vizinhos).forEach((dir) => {
            if (this.cen.salas[vizinhos[dir]]) portaEm[dir] = vizinhos[dir];
        });

        const ehPorta = (col, lin) =>
            (portaEm.cima && lin === 0 && (col === 9 || col === 10)) ||
            (portaEm.baixo && lin === RD.LINHAS - 1 && (col === 9 || col === 10)) ||
            (portaEm.esquerda && col === 0 && (lin === 5 || lin === 6)) ||
            (portaEm.direita && col === RD.COLS - 1 && (lin === 5 || lin === 6));

        const texParede = 'parede_' + this.cen.id;
        for (let col = 0; col < RD.COLS; col++) {
            for (let lin = 0; lin < RD.LINHAS; lin++) {
                const borda = col === 0 || lin === 0 || col === RD.COLS - 1 || lin === RD.LINHAS - 1;
                if (!borda || ehPorta(col, lin)) continue;
                const p = RD.posTile(col, lin);
                this.gParedes.create(p.x, p.y, texParede).setDepth(2);
            }
        }

        // Portas
        const T = RD.TILE;
        const lugar = {
            cima: { x: RD.CENTRO_X, y: RD.TOPO + T / 2, ang: 0, w: 96, h: 48, gx: RD.CENTRO_X, gy: RD.TOPO + 12, gw: 96, gh: 24 },
            baixo: { x: RD.CENTRO_X, y: RD.ALTURA - T / 2, ang: 180, w: 96, h: 48, gx: RD.CENTRO_X, gy: RD.ALTURA - 12, gw: 96, gh: 24 },
            esquerda: { x: T / 2, y: RD.CENTRO_Y, ang: -90, w: 48, h: 96, gx: 12, gy: RD.CENTRO_Y, gw: 24, gh: 96 },
            direita: { x: RD.LARGURA - T / 2, y: RD.CENTRO_Y, ang: 90, w: 48, h: 96, gx: RD.LARGURA - 12, gy: RD.CENTRO_Y, gw: 24, gh: 96 },
        };

        Object.keys(portaEm).forEach((dir) => {
            const destino = portaEm[dir];
            const dDest = this.cen.salas[destino];
            const L = lugar[dir];
            const kDest = RD.Estado.chave(e.cenario, destino);
            const escondida = dDest.tipo === 'secreta' && !e.segredos[kDest] && !this.rachadasAbertas(kDest);

            if (escondida) {
                const img = this.add.image(L.x, L.y, 'rachada_' + this.cen.id).setAngle(L.ang).setDepth(2);
                this.objSala.push(img);
                const z = this.add.zone(L.x, L.y, L.w, L.h);
                this.physics.add.existing(z, true);
                this.gRachadas.add(z);
                z.img = img;
                z.vida = 3;
                z.dir = dir;
                z.destino = destino;
                return;
            }
            this.criarPorta(dir, destino, L);
        });
    }

    // Uma parede rachada já quebrada continua aberta ao voltar
    rachadasAbertas(kDest) {
        return !!(RD.estado.rachadas && RD.estado.rachadas[kDest]);
    }

    criarPorta(dir, destino, L) {
        const trancada = !this.salaLimpa;
        const img = this.add.image(L.x, L.y, trancada ? 'porta_trancada' : 'porta_aberta').setAngle(L.ang).setDepth(3);
        this.objSala.push(img);
        const porta = { img, dir, destino, L, bloqueio: null, gatilho: null };
        if (trancada) {
            // porta trancada: um bloqueio invisível que não deixa passar
            porta.bloqueio = this.add.zone(L.x, L.y, L.w, L.h);
            this.physics.add.existing(porta.bloqueio, true);
            this.gPortasFechadas.add(porta.bloqueio);
        } else {
            this.criarGatilho(porta);
        }
        this.portas.push(porta);
    }

    // Área na entrada da porta que leva para a outra sala
    criarGatilho(porta) {
        const L = porta.L;
        const g = this.add.zone(L.gx, L.gy, L.gw, L.gh);
        this.physics.add.existing(g, true);
        this.gPortasAbertas.add(g);
        g.dir = porta.dir;
        g.destino = porta.destino;
        porta.gatilho = g;
    }

    criarConteudo(d, k) {
        const e = RD.estado;

        // Blocos e inimigos desenhados no mapa da sala
        if (d.mapa) {
            const porLetra = {};
            Object.keys(RD.INIMIGOS).forEach((id) => {
                if (RD.INIMIGOS[id].letraNoMapa) porLetra[RD.INIMIGOS[id].letraNoMapa] = id;
            });
            d.mapa.forEach((linha, lin) => {
                for (let col = 0; col < linha.length; col++) {
                    const ch = linha[col];
                    const p = RD.posTile(col + 1, lin + 1);
                    if (ch === '#') this.gObst.create(p.x, p.y, 'bloco_' + this.cen.id).setDepth(3);
                    else if (porLetra[ch] && !this.salaLimpa) RD.IA.criar(this, porLetra[ch], p.x, p.y, this.cen.forcaInimigos);
                }
            });
        }

        // Atividade
        if (d.atividade && !e.atividades[k]) {
            const def = RD.ATIVIDADES[d.atividade];
            if (def) this.atividade = new RD.Atividade(this, def);
            else console.warn('Atividade não encontrada: ' + d.atividade);
        }

        // Upgrade
        if (d.item && !e.itens[k] && RD.UPGRADES[d.item]) {
            const up = RD.UPGRADES[d.item];
            const base = this.add.ellipse(RD.CENTRO_X, RD.CENTRO_Y + 30, 64, 18, 0x000000, 0.45).setDepth(3);
            this.objSala.push(base);
            const item = this.gItens.create(RD.CENTRO_X, RD.CENTRO_Y, up.textura).setDepth(5);
            item.upgrade = d.item;
            this.tweens.add({ targets: item, y: RD.CENTRO_Y - 8, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }

        // Personagem que conversa
        if (d.npc && RD.TEXTOS.npcs[d.npc]) {
            const info = RD.TEXTOS.npcs[d.npc];
            const p = d.tipo === 'inicio' ? RD.posTile(6, 4) : { x: RD.CENTRO_X, y: RD.CENTRO_Y - 40 };
            const npc = this.gNpcs.create(p.x, p.y, info.textura).setDepth(5);
            npc.body.setSize(32, 32);
            npc.id = d.npc;
            RD.Efeitos.sombra(this, npc, 0.8);
            npc.info = info;
            // balãozinho "E Falar" em cima do personagem
            const balao = this.add.container(p.x, p.y - 50).setDepth(9).setVisible(false);
            const txt = this.add.text(14, 0, 'Falar', RD.UI.estilo(16, '#ffffff', { fontStyle: '700' })).setOrigin(0, 0.5);
            const larg = 52 + txt.width;
            const g = this.add.graphics();
            g.fillStyle(0x000000, 1);
            g.fillRoundedRect(-larg / 2 + 0, -17, larg, 34, 8);
            g.fillTriangle(-8, 16, 8, 16, 0, 26);
            g.lineStyle(3, 0xffffff, 1);
            g.strokeRoundedRect(-larg / 2, -17, larg, 34, 8);
            const tecla = this.add.rectangle(-larg / 2 + 20, 0, 22, 22, 0xffd23f).setStrokeStyle(2, 0x000000);
            const letraE = this.add.text(-larg / 2 + 20, 0, 'E', RD.UI.estilo(15, '#000000', { fontStyle: '700' })).setOrigin(0.5);
            txt.setX(-larg / 2 + 38);
            balao.add([g, tecla, letraE, txt]);
            this.tweens.add({ targets: balao, y: p.y - 56, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            npc.balao = balao;
            this.objSala.push(balao);
        }

        // Dicas no chão da primeira sala
        if (d.tipo === 'inicio') {
            RD.TEXTOS.dicasChao.forEach((dc) => {
                const p = RD.posTile(dc.col, dc.lin);
                this.objSala.push(this.add.text(p.x, p.y, dc.texto, RD.UI.estilo(20, '#c9d3ff', { fontStyle: '600' }))
                    .setOrigin(0.5).setAlpha(0.6).setDepth(1));
            });
        }

        // Buraco com escada para o próximo cenário + plaquinha dizendo para onde vai
        if (d.tipo === 'passagem') {
            const cx = RD.CENTRO_X - 20, cy = RD.CENTRO_Y;
            // a escada fica virada para a porta por onde o jogador chega
            let lado = this.entradaSala;
            if (!lado) {
                const [sx, sy] = this.salaChave.split(',').map(Number);
                const viz = { cima: [0, -1], baixo: [0, 1], esquerda: [-1, 0], direita: [1, 0] };
                lado = Object.keys(viz).find(l => this.cen.salas[(sx + viz[l][0]) + ',' + (sy + viz[l][1])]) || 'cima';
            }
            this.objSala.push(this.add.image(cx, cy, 'escada_' + this.cen.id + '_' + lado).setDepth(1.5));
            this.escadaInfo = { cx, cy, lado };
            // poeirinha subindo devagar do buraco
            this.objSala.push(this.add.particles(0, 0, 'faisca', {
                x: { min: cx - 26, max: cx + 26 }, y: { min: cy - 14, max: cy + 26 },
                speedY: { min: -16, max: -6 }, lifespan: 2000, frequency: 320,
                scale: { start: 0.4, end: 0.1 }, alpha: { start: 0.3, end: 0 }, tint: 0xc9d3ff,
            }).setDepth(1.6));
            // área que leva para o próximo cenário (o meio da escada)
            const portal = this.add.zone(cx, cy + 4, 44, 44);
            this.physics.add.existing(portal, true);
            this.gPortal.add(portal);
            const proximo = RD.CENARIOS[RD.estado.cenario + 1];
            if (proximo) {
                const px = cx + 92, py = cy - 14;
                const placa = this.add.image(px, py, 'placa').setDepth(6);
                this.objSala.push(placa);
                this.objSala.push(this.add.text(px, py - 11, proximo.nome, RD.UI.estilo(10, '#2a1a0e', {
                    fontStyle: '700', align: 'center', wordWrap: { width: 70 }, lineSpacing: -3,
                })).setOrigin(0.5).setDepth(6.1));
                // a placa é sólida (não dá para atravessar)
                const z = this.add.zone(px, py + 22, 16, 12);
                this.physics.add.existing(z, true);
                this.gObst.add(z);
                RD.Efeitos.sombra(this, placa, 0.6, 27);
            }
        }
    }

    posicionarJogador(entrada) {
        const j = this.jogador;
        const m = RD.TILE + 40;
        let x = RD.CENTRO_X, y = RD.CENTRO_Y;
        if (entrada === 'cima') y = RD.TOPO + m;
        else if (entrada === 'baixo') y = RD.ALTURA - m;
        else if (entrada === 'esquerda') x = m;
        else if (entrada === 'direita') x = RD.LARGURA - m;
        else if (this.salaDef.tipo === 'inicio') y = RD.CENTRO_Y + 60;
        j.setPosition(x, y);
        j.setVelocity(0, 0);
    }

    atualizarTextoSala() {
        const d = this.salaDef;
        const T = RD.TEXTOS.salas;
        if (this.atividade) { this.atividade.atualizarHud(); return; }
        let sub = T[d.tipo] || '';
        if (d.tipo === 'combate' && this.salaLimpa) sub = T.limpa;
        if (d.tipo === 'atividade') sub = T.atividadeFeita;
        this.hud.setTarefa(this.cen.nome, sub, 26);
    }

    // ------------------------------------------------------------------
    // PORTAS, SEGREDOS E CENÁRIOS
    // ------------------------------------------------------------------

    abrirPortas() {
        this.portas.forEach((p) => {
            p.img.setTexture('porta_aberta');
            if (p.bloqueio) { p.bloqueio.destroy(); p.bloqueio = null; }
            if (!p.gatilho) this.criarGatilho(p);
        });
    }

    salaConcluida() {
        this.salaLimpa = true;
        RD.estado.limpas[this.salaK] = true;
        this.abrirPortas();
        if (this.portas.length) {
            RD.Som.tocar('porta');
            RD.UI.aviso(this, RD.TEXTOS.feedback.portas, 1800);
        }
        if (this.escuro) {
            const esc = this.escuro;
            this.escuro = null;
            this.tweens.add({ targets: esc, alpha: 0, duration: 900, onComplete: () => esc.destroy() });
        }
        this.atualizarTextoSala();
        this.hud.atualizarMapa(RD.estado.cenario, this.salaChave);
    }

    atividadeConcluida() {
        RD.estado.atividades[this.salaK] = true;
        this.atividade = null;
        // salaConcluida é chamada no update quando não sobra nada
    }

    passarPorta(z) {
        if (this.trocando || !z.active || this.time.now < this.podeTrocarEm) return;
        const destino = z.destino;
        const oposto = { cima: 'baixo', baixo: 'cima', esquerda: 'direita', direita: 'esquerda' }[z.dir];
        const dDest = this.cen.salas[destino];
        this.trocando = true;
        this.jogador.setVelocity(0, 0);
        this.cameras.main.fadeOut(160, 13, 16, 36);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            if (dDest.tipo === 'chefe') {
                RD.estado.sala = destino;
                this.scene.start('Chefe');
                return;
            }
            this.montarSala(destino, oposto);
            this.cameras.main.fadeIn(160, 13, 16, 36);
            this.trocando = false;
        });
    }

    acertarRachada(tiro, z) {
        tiro.destroy();
        if (!z.active) return;
        z.vida -= tiro.dano || 1;
        RD.Som.tocar('acerto');
        this.tweens.add({ targets: z.img, x: z.img.x + 4, duration: 40, yoyo: true, repeat: 2 });
        if (z.vida > 0) {
            if (!this.avisouRachadura) {
                this.avisouRachadura = true;
                RD.UI.aviso(this, RD.TEXTOS.feedback.rachadura, 1600);
            }
            return;
        }
        // abre a passagem secreta
        const e = RD.estado;
        const kDest = RD.Estado.chave(e.cenario, z.destino);
        e.rachadas = e.rachadas || {};
        e.rachadas[kDest] = true;
        RD.Som.tocar('segredo');
        RD.UI.aviso(this, RD.TEXTOS.feedback.segredo, 2200);
        const L = { x: z.x, y: z.y, ang: z.img.angle, w: z.width, h: z.height };
        Object.assign(L, this.gatilhoPara(z.dir));
        z.img.destroy();
        z.destroy();
        const estava = this.salaLimpa;
        this.salaLimpa = true; // a porta secreta nasce aberta
        this.criarPorta(z.dir, z.destino, L);
        this.salaLimpa = estava;
    }

    gatilhoPara(dir) {
        return {
            cima: { gx: RD.CENTRO_X, gy: RD.TOPO + 12, gw: 96, gh: 24 },
            baixo: { gx: RD.CENTRO_X, gy: RD.ALTURA - 12, gw: 96, gh: 24 },
            esquerda: { gx: 12, gy: RD.CENTRO_Y, gw: 24, gh: 96 },
            direita: { gx: RD.LARGURA - 12, gy: RD.CENTRO_Y, gw: 24, gh: 96 },
        }[dir];
    }

    proximoCenario() {
        if (this.trocando) return;
        this.trocando = true;
        this.jogador.setVelocity(0, 0);
        this.descerEscada(() => this.irParaProximoCenario());
    }

    // O Readapt anda até o primeiro degrau e desce degrau por degrau:
    // a cada passo ele fica menor e mais escuro, e o corpo some atrás da
    // borda do fundo do buraco.
    descerEscada(fim) {
        const j = this.jogador;
        const info = this.escadaInfo;
        if (!info) { fim(); return; }
        j.body.enable = false;
        j.anims.stop();
        // a sombra do Readapt não desce junto
        (this.sombras || []).forEach((s) => { if (s.alvo === j) s.destroy(); });

        const { cx, cy, lado } = info;
        // para onde a escada desce (contrário da porta de entrada) e a animação de andar
        const dir = { cima: [0, 1, 'frente'], baixo: [0, -1, 'costas'], esquerda: [1, 0, 'direita'], direita: [-1, 0, 'esquerda'] }[lado];
        const [dx, dy, anim] = dir;
        const PES = 26;                       // dos pés até o meio do sprite
        const degraus = [-28, -16, -4, 8, 20]; // meio de cada degrau, a partir do centro do buraco
        const pos = (i, escala) => {
            const d = degraus[i];
            if (dy) return { x: cx, y: cy + dy * d - PES * escala };
            return { x: cx + dx * d, y: cy + 4 + i * 3 - PES * escala };
        };

        // o corpo é cortado na borda do fundo do buraco
        const g = this.make.graphics({ add: false });
        g.fillStyle(0xffffff);
        const B = 34, G = 2000;
        if (dy > 0) g.fillRect(-G, -G, 2 * G, cy + B + G);
        else if (dy < 0) g.fillRect(-G, cy - B, 2 * G, G);
        else if (dx > 0) g.fillRect(-G, -G, cx + B + G, 2 * G);
        else g.fillRect(cx - B, -G, G, 2 * G);
        j.setMask(g.createGeometryMask());

        j.anims.play('andar_' + anim, true);
        // 1) chega no primeiro degrau
        const p0 = pos(0, 1);
        this.tweens.add({ targets: j, x: p0.x, y: p0.y, duration: 260, onComplete: () => {
            // 2) desce degrau por degrau
            let i = 0;
            const passo = () => {
                i++;
                if (i >= degraus.length) {
                    RD.Som.tocar('portal');
                    this.tweens.add({ targets: j, alpha: 0, duration: 200, onComplete: fim });
                    return;
                }
                const escala = 1 - i * 0.07;
                const p = pos(i, escala);
                const escuro = Math.round(255 * (1 - i * 0.16));
                j.setTint(Phaser.Display.Color.GetColor(escuro, escuro, escuro + 10 > 255 ? 255 : escuro + 10));
                this.tweens.add({ targets: j, x: p.x, y: p.y, scale: escala, duration: 230, ease: 'Quad.easeIn', onComplete: passo });
                RD.Som.tocar('passo');
            };
            passo();
        } });
    }

    irParaProximoCenario() {
        this.cameras.main.fadeOut(800, 13, 16, 36);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            const e = RD.estado;
            e.cenario++;
            e.sala = null;
            e.vida = e.vidaMax; // chega no novo cenário com a vida cheia
            RD.Estado.salvarCheckpoint();
            this.scene.restart({ titulo: true });
        });
    }

    mostrarTitulo() {
        const c = this.add.container(RD.CENTRO_X, RD.CENTRO_Y).setDepth(250).setAlpha(0);
        const fundo = this.add.rectangle(0, 0, 720, 150, 0x0d1024, 0.92).setStrokeStyle(4, 0xffd23f);
        const t1 = this.add.text(0, -24, this.cen.nome, RD.UI.estilo(40, '#ffd23f', { fontStyle: '700' })).setOrigin(0.5);
        const t2 = this.add.text(0, 32, this.cen.subtitulo || '', RD.UI.estilo(20, '#cfe0ff')).setOrigin(0.5);
        c.add([fundo, t1, t2]);
        this.objTitulo = c;
        this.tweens.add({
            targets: c, alpha: 1, duration: 500, hold: 1800, yoyo: true,
            onComplete: () => c.destroy(),
        });
    }

    // ------------------------------------------------------------------
    // ITENS, PERSONAGENS E DIÁLOGOS
    // ------------------------------------------------------------------

    pegarItem(item) {
        if (!item.active) return;
        if (item.cura) {
            if (RD.estado.vida >= RD.estado.vidaMax) return;
            RD.estado.vida = Math.min(RD.estado.vidaMax, RD.estado.vida + item.cura);
            RD.Som.tocar('certo');
            this.hud.atualizarVida();
            item.destroy();
            return;
        }
        const id = item.upgrade;
        RD.estado.itens[this.salaK] = true;
        RD.Estado.ganharUpgrade(id);
        item.destroy();
        RD.Som.tocar('item');
        this.hud.atualizarVida();
        this.hud.atualizarUpgrades();
        RD.UI.aviso(this, RD.UPGRADES[id].descricao, 3200);
    }

    // Caixa de conversa no estilo Undertale: preta, borda branca, retrato e texto letra por letra.
    // Fica embaixo; se o Readapt estiver na parte de baixo da sala, ela vai para cima.
    abrirDialogo(npc) {
        const info = npc.info;
        this.dialogo = { npc, linha: 0 };
        this.jogador.setVelocity(0, 0);
        this.physics.pause();
        npc.balao.setVisible(false);

        const larg = 860, alt = 150;
        const emCima = this.jogador.y > RD.CENTRO_Y + 40;
        const x0 = (RD.LARGURA - larg) / 2;
        const y0 = emCima ? RD.TOPO + 22 : RD.ALTURA - alt - 22;
        const c = this.add.container(0, 0).setDepth(200);

        const g = this.add.graphics();
        g.fillStyle(0x000000, 1);
        g.fillRect(x0, y0, larg, alt);
        g.lineStyle(6, 0xffffff, 1);
        g.strokeRect(x0 + 3, y0 + 3, larg - 6, alt - 6);
        // quadro do retrato
        g.lineStyle(3, 0xffffff, 1);
        g.strokeRect(x0 + 18, y0 + 18, 114, 114);
        g.fillStyle(0x14142b, 1);
        g.fillRect(x0 + 20, y0 + 20, 110, 110);
        c.add(g);
        const retrato = this.add.image(x0 + 75, y0 + 75, info.textura).setScale(2);
        c.add(retrato);
        this.tweens.add({ targets: retrato, y: y0 + 71, duration: 260, yoyo: true, repeat: -1 });

        // nome numa etiqueta
        const nome = this.add.text(x0 + 154, y0 + 20, info.nome, RD.UI.estilo(20, '#ffd23f', { fontStyle: '700' }));
        const texto = this.add.text(x0 + 154, y0 + 52, '', RD.UI.estilo(23, '#ffffff', {
            wordWrap: { width: larg - 190 }, lineSpacing: 6,
        }));
        const seta = this.add.text(x0 + larg - 30, y0 + alt - 24, '▼', RD.UI.estilo(18, '#ffffff')).setOrigin(0.5).setVisible(false);
        this.tweens.add({ targets: seta, y: y0 + alt - 18, duration: 400, yoyo: true, repeat: -1 });
        const contador = this.add.text(x0 + larg - 52, y0 + alt - 24, '', RD.UI.estilo(14, '#8a90ad')).setOrigin(1, 0.5);
        c.add([nome, texto, seta, contador]);

        this.dialogo.c = c;
        this.dialogo.texto = texto;
        this.dialogo.seta = seta;
        this.dialogo.contador = contador;
        this.mostrarFala();
    }

    // Escreve a fala atual letra por letra
    mostrarFala() {
        const dg = this.dialogo;
        const falas = dg.npc.info.falas;
        const frase = falas[dg.linha];
        dg.contador.setText((dg.linha + 1) + '/' + falas.length);
        dg.seta.setVisible(false);
        dg.escrevendo = true;
        dg.frase = frase;
        let n = 0;
        dg.texto.setText('');
        if (dg.ev) dg.ev.remove();
        dg.ev = this.time.addEvent({
            delay: 26, repeat: frase.length - 1, callback: () => {
                n++;
                dg.texto.setText(frase.slice(0, n));
                if (n % 3 === 0 && frase[n - 1] !== ' ') RD.Som.tocar('fala');
                if (n >= frase.length) { dg.escrevendo = false; dg.seta.setVisible(true); }
            },
        });
    }

    avancarDialogo() {
        const dg = this.dialogo;
        const info = dg.npc.info;
        if (dg.escrevendo) {
            // primeiro aperto mostra a frase inteira
            dg.ev.remove();
            dg.texto.setText(dg.frase);
            dg.escrevendo = false;
            dg.seta.setVisible(true);
            return;
        }
        dg.linha++;
        if (dg.linha < info.falas.length) {
            RD.Som.tocar('menu');
            this.mostrarFala();
            return;
        }
        if (dg.ev) dg.ev.remove();
        this.tweens.killTweensOf(dg.c.list);
        dg.c.destroy();
        this.dialogo = null;
        this.physics.resume();
        const k = this.salaK;
        if (info.presente && !RD.estado.conversas[k]) {
            RD.estado.conversas[k] = true;
            RD.Estado.ganharUpgrade(info.presente);
            RD.Som.tocar('item');
            this.hud.atualizarVida();
            this.hud.atualizarUpgrades();
            RD.UI.aviso(this, RD.UPGRADES[info.presente].descricao, 3200);
        }
    }

    // ------------------------------------------------------------------
    // DANO E DERROTA
    // ------------------------------------------------------------------

    danoJogador(qtd) {
        if (this.trocando) return;
        if (RD.Jogador.levarDano(this, qtd)) this.perder();
    }

    perder() {
        this.trocando = true;
        this.physics.pause();
        RD.Som.tocar('derrota');
        this.cameras.main.fadeOut(900, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Fim', { final: 'ruim' }));
    }

    // ------------------------------------------------------------------
    // PAUSA
    // ------------------------------------------------------------------

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

    // ------------------------------------------------------------------
    // LAÇO PRINCIPAL
    // ------------------------------------------------------------------

    update(tempo) {
        if (this.trocando) return;
        const J = Phaser.Input.Keyboard.JustDown;
        const t = this.teclas;

        if (J(t.M)) {
            const lig = RD.Som.alternar();
            if (this.telaPausa && this.pausado) this.telaPausa.atualizarSom();
            else RD.UI.aviso(this, 'Som ' + (lig ? 'ligado' : 'desligado'), 1200);
        }

        if (this.dialogo) {
            if (J(t.E) || J(t.ENTER) || J(t.SPACE)) this.avancarDialogo();
            return;
        }

        if (J(t.ESC)) this.alternarPausa();
        if (this.pausado) {
            if (J(t.Q)) { this.scene.start('Menu'); }
            return;
        }

        RD.Jogador.mover(this);
        RD.Jogador.atirar(this, tempo);
        RD.Jogador.limparTiros(this, tempo);
        RD.Jogador.atualizarVisual(this, tempo);
        RD.IA.atualizar(this, tempo);
        RD.Efeitos.atualizar(this);

        if (this.escuro) this.escuro.setPosition(this.jogador.x, this.jogador.y);

        // Personagem por perto?
        this.npcPerto = null;
        this.gNpcs.getChildren().forEach((npc) => {
            const perto = Phaser.Math.Distance.Between(npc.x, npc.y, this.jogador.x, this.jogador.y) < 90;
            npc.balao.setVisible(perto);
            if (perto) this.npcPerto = npc;
        });

        if (J(t.E) || J(t.ENTER)) {
            if (this.npcPerto) this.abrirDialogo(this.npcPerto);
            else if (this.atividade) this.atividade.ouvir();
        }

        // Sala concluída?
        if (!this.salaLimpa) {
            const semInimigos = this.gInimigos.countActive(true) === 0;
            const atividadeOk = !this.atividade || this.atividade.concluida;
            if (semInimigos && atividadeOk) this.salaConcluida();
        }
    }
};
