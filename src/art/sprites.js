// =====================================================================
// ARTE GERADA POR CÓDIGO
// ---------------------------------------------------------------------
// Todos os sprites do jogo são desenhados aqui, cada um com um nome de
// textura. Se existir uma imagem em assets/ com o mesmo nome (e ela
// estiver listada em assets/artes.js), o jogo usa a imagem no lugar
// do desenho, já no tamanho certo.
//
// Nos desenhos "pixel a pixel", cada letra é uma cor da paleta e
// o ponto (.) é transparente.
// =====================================================================

RD.Arte = {
    lista: [],

    // Registra um desenho livre (feito com o canvas)
    add(chave, largura, altura, uso, desenhar, naoTrocavel) {
        this.lista.push({ chave, largura, altura, uso, desenhar, naoTrocavel: !!naoTrocavel });
    },

    // Registra um desenho pixel a pixel.
    // "sombrear" (opcional) lista as cores que ganham volume automático:
    // bordas de baixo/direita mais escuras e de cima/esquerda mais claras.
    mapa(chave, linhas, paleta, px, uso, depois, sombrear) {
        const largura = linhas[0].length * px;
        const altura = linhas.length * px;
        this.add(chave, largura, altura, uso, (ctx) => {
            const em = (x, y) => (linhas[y] && linhas[y][x]) || '.';
            linhas.forEach((linha, y) => {
                if (linha.length !== linhas[0].length) {
                    console.warn('Sprite "' + chave + '": a linha ' + y + ' tem tamanho diferente.');
                }
                for (let x = 0; x < linha.length; x++) {
                    const ch = linha[x];
                    let cor = paleta[ch];
                    if (!cor) continue;
                    if (sombrear && sombrear.indexOf(ch) >= 0) {
                        const borda = (c) => c === '.' || c === 'k';
                        if (borda(em(x, y + 1)) || borda(em(x + 1, y))) cor = RD.Arte.tom(cor, -0.28);
                        else if (borda(em(x, y - 1)) || borda(em(x - 1, y))) cor = RD.Arte.tom(cor, 0.22);
                    }
                    ctx.fillStyle = cor;
                    ctx.fillRect(x * px, y * px, px, px);
                }
            });
            if (depois) depois(ctx, largura, altura);
        });
    },

    // Clareia (valor positivo) ou escurece (negativo) uma cor #rrggbb
    tom(hex, f) {
        const n = parseInt(hex.slice(1), 16);
        let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        const m = (c) => Math.round(f >= 0 ? c + (255 - c) * f : c * (1 + f));
        r = m(r); g = m(g); b = m(b);
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    // Números "aleatórios" que se repetem sempre iguais (para texturas)
    aleatorio(semente) {
        let s = semente || 1;
        return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    },

    // Cria todas as texturas (chamado na cena Boot)
    gerarTudo(cena) {
        this.lista.forEach((s) => {
            if (cena.textures.exists(s.chave)) return;
            const tex = cena.textures.createCanvas(s.chave, s.largura, s.altura);
            const ctx = tex.getContext();
            ctx.imageSmoothingEnabled = false;
            const arquivo = 'arquivo_' + s.chave;
            if (!s.naoTrocavel && cena.textures.exists(arquivo)) {
                const img = cena.textures.get(arquivo).getSourceImage();
                ctx.drawImage(img, 0, 0, s.largura, s.altura);
            } else {
                s.desenhar(ctx, s.largura, s.altura);
            }
            tex.refresh();
        });
    },
};

(function () {
    const A = RD.Arte;
    const P = RD.PIXEL;
    const K = '#14142b'; // contorno escuro

    // Escreve uma letra/texto dentro de um desenho
    function texto(ctx, s, x, y, tam, cor, ang, contorno) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang || 0);
        ctx.font = '700 ' + tam + 'px ' + RD.FONTE;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (contorno !== false) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = K;
            ctx.strokeText(s, 0, 0);
        }
        ctx.fillStyle = cor;
        ctx.fillText(s, 0, 0);
        ctx.restore();
    }

    function retArredondado(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    // ---------------- READAPT (jogador) ----------------
    // Readapt: cabeça grande de tela (estilo Isaac), olhos e sorriso ciano,
    // antena com luz amarela, corpo azul com um livro no peito.
    const READAPT = [
        '........................',
        '........................',
        '........................',
        '........................',
        '...........yy...........',
        '..........kyyk..........',
        '...........kk...........',
        '....kkkkkkkkkkkkkkkk....',
        '...kwwwwwwwwwwwwwwwwk...',
        '...kwvCCvvvvvvvvvvvwk...',
        '...kwvCvvvvvvvvvvvvwk...',
        '...kwvvccvvvvvvccvvwk...',
        '...kwvvccvvvvvvccvvwk...',
        '...kwvvvvvvvvvvvvvvwk...',
        '...kwvvvvvcvvcvvvvvwk...',
        '...kwvvvvvvccvvvvvvwk...',
        '...kwwwwwwwwwwwwwwwwk...',
        '....kkkkkkkkkkkkkkkk....',
        '......kkbbbbbbbbkk......',
        '.....kbbbbbbbbbbbbk.....',
        '....kgkbbbyyyybbbkgk....',
        '....kgkbbbyWWybbbkgk....',
        '....kkkbbbbbbbbbbkkk....',
        '.....kbbbbbbbbbbbbk.....',
        '......kbbbkkkkbbbk......',
        '......kdddk..kdddk......',
        '......kgggk..kgggk......',
        '......kkkkk..kkkkk......',
    ];
    const PAL_READAPT = {
        k: K, w: '#e8f1ff', v: '#0b1a3a', c: '#5ff0ff', C: '#2a5a80', y: '#ffd23f', W: '#fff4d6',
        b: '#2463eb', g: '#9fb3d1', d: '#5d6b8a',
    };
    // Um desenho para cada direção (as imagens da pasta assets substituem estes)
    A.mapa('readapt', READAPT, PAL_READAPT, 2, 'Jogador olhando para baixo (frente)', null, 'wbgy');
    A.mapa('readapt_costas', READAPT, PAL_READAPT, 2, 'Jogador olhando para cima (costas)', null, 'wbgy');
    A.mapa('readapt_direita', READAPT, PAL_READAPT, 2, 'Jogador olhando para a direita', null, 'wbgy');
    A.mapa('readapt_esquerda', READAPT, PAL_READAPT, 2, 'Jogador olhando para a esquerda', null, 'wbgy');

    // ---------------- INIMIGOS ----------------
    const BLOB = [
        '................',
        '.....kkkkkk.....',
        '...kkrrrrrrkk...',
        '..krrrrrrrrrrk..',
        '..krrrrrrrrrrk..',
        '.krrwwrrrrwwrrk.',
        '.krrwkrrrrwkrrk.',
        '.krrrrrrrrrrrrk.',
        '.krrrrrrrrrrrrk.',
        '.krrrrrrrrrrrrk.',
        '.krrrrrrrrrrrrk.',
        '..krrrrrrrrrrk..',
        '..krrkrrrrkrrk..',
        '..krk.krrk.krk..',
        '...k...kk...k...',
        '................',
    ];

    A.mapa('letra_torta', BLOB, { k: K, r: '#e63946', w: '#ffffff' }, P,
        'Inimigo Letra Torta', (ctx) => texto(ctx, 'R', 24, 31, 18, '#ffd23f', -0.4), 'r');

    A.mapa('silaba_quebrada', BLOB, { k: K, r: '#ff8c1a', w: '#ffffff' }, P,
        'Inimigo Sílaba Quebrada', (ctx) => {
            texto(ctx, 'BA', 24, 31, 15, '#ffffff');
            ctx.strokeStyle = K;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(25, 7); ctx.lineTo(22, 15); ctx.lineTo(26, 23); ctx.lineTo(22, 33); ctx.lineTo(25, 42);
            ctx.stroke();
        }, 'r');

    A.mapa('silaba_pedaco', [
        '...kkkk...',
        '.kkrrrrkk.',
        '.krrrrrrk.',
        'krrwrrwrrk',
        'krrkrrkrrk',
        'krrrrrrrrk',
        'krrrrrrrrk',
        '.krrrrrrk.',
        '.kk.kk.kk.',
        '..........',
    ], { k: K, r: '#ffb347', w: '#ffffff' }, P, 'Pedaço da Sílaba Quebrada', null, 'r');

    A.mapa('palavra_embaralhada', [
        '................',
        '..kkkkkkkkkkkk..',
        '..kggggggggggk..',
        '..kgwwwwwwwwgk..',
        '..kgwwwwwwwwgk..',
        '..kgwwwwwwwwgk..',
        '..kggggggggggk..',
        '..kgrrggggrrgk..',
        '..kgrkggggrkgk..',
        '..kggggggggggk..',
        '..kggggggggggk..',
        '..kkkkkkkkkkkk..',
        '.....kkddkk.....',
        '.....kddddk.....',
        '......kkkk......',
        '................',
    ], { k: K, g: '#3fbf5f', w: '#f4fff6', r: '#e63946', d: '#2a7a3e' }, P,
    'Inimigo Palavra Embaralhada (fica parado e atira)',
    (ctx) => texto(ctx, 'ATOG', 24, 13, 9, K, 0, false), 'g');

    A.mapa('criatura_confusao', [
        '................',
        '......kkkk......',
        '....kkttttkk....',
        '...kttttttttk...',
        '..kttttttttttk..',
        '..kttwwttwwttk..',
        '..kttwkttwkttk..',
        '..kttttttttttk..',
        '.kttttttttttttk.',
        '.kttttttttttttk.',
        '.kttttttttttttk.',
        '.kttttttttttttk.',
        '.kttkttkttkttk..',
        '.kk.kk.kk.kk....',
        '................',
        '................',
    ], { k: K, t: '#f2f2ff', w: '#7a3cff' }, P,
    'Inimigo Criatura da Confusão (muda de lugar)',
    (ctx) => texto(ctx, '?', 24, 30, 18, '#7a3cff', 0.2), 't');

    // ---------------- CHEFE ----------------
    // A Dislexia: uma montanha de letras embaralhadas (algumas viradas ao contrário),
    // com dois olhos vermelhos espiando no alto. Desenhada em metade do tamanho
    // e ampliada 2x para ficar com cara de pixel art.
    A.add('chefe_dislexia', 168, 168, 'Chefe final: a Dislexia (montanha de letras)', (ctx) => {
        const S = 84;
        const tela = document.createElement('canvas');
        tela.width = S; tela.height = S;
        const c = tela.getContext('2d');
        const r = A.aleatorio(4242);
        const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZbdpq';
        const cores = ['#e9e2d0', '#cfc6b0', '#ff4d6d', '#b3261e', '#8a4fb8', '#6b2f8f', '#5d6b8a', '#ffd23f'];
        const letra = (l, x, y, tam, cor, ang, espelho) => {
            c.save(); c.translate(x, y); c.rotate(ang); c.scale(espelho ? -1 : 1, 1);
            c.font = '700 ' + tam + 'px ' + RD.FONTE;
            c.textAlign = 'center'; c.textBaseline = 'middle';
            c.lineWidth = 3; c.strokeStyle = K; c.strokeText(l, 0, 0);
            c.fillStyle = cor; c.fillText(l, 0, 0);
            c.restore();
        };

        // sombra escura da montanha (para não ficar "vazada" entre as letras)
        c.fillStyle = '#1a0d24';
        c.beginPath();
        c.moveTo(2, 82); c.quadraticCurveTo(14, 40, 42, 10); c.quadraticCurveTo(70, 40, 82, 82);
        c.closePath(); c.fill();

        // camadas de letras: de baixo (grandes) para cima (pequenas)
        for (let y = 80; y >= 16; y -= 4) {
            const t = (80 - y) / 64;                 // 0 embaixo, 1 no topo
            const meia = 40 * (1 - t) + 4;           // metade da largura da montanha nesta altura
            const qtd = Math.max(1, Math.round(meia / 5));
            for (let i = 0; i < qtd; i++) {
                const x = 42 + (r() * 2 - 1) * meia;
                const tam = Math.round(18 - t * 8 + r() * 4);
                letra(letras[Math.floor(r() * letras.length)], x, y + (r() - 0.5) * 3, tam,
                    cores[Math.floor(r() * cores.length)], (r() - 0.5) * 1.6, r() < 0.3);
            }
        }

        // olhos espiando entre as letras (os mesmos lugares usados pelo brilho no menu)
        [[33, 36], [51, 36]].forEach(([ex, ey], i) => {
            c.fillStyle = K; c.fillRect(ex - 6, ey - 4, 12, 8);
            c.fillStyle = '#ff2a2a'; c.fillRect(ex - 5, ey - 3, 10, 6);
            c.fillStyle = '#ffd0d0'; c.fillRect(ex - 2 + (i ? -1 : 1), ey - 2, 3, 3);
            c.fillStyle = K;
            c.save(); c.translate(ex, ey - 6); c.rotate(i ? -0.4 : 0.4); c.fillRect(-7, -1, 14, 3); c.restore();
        });

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tela, 0, 0, 168, 168);
    });

    // ---------------- PERSONAGENS AMIGOS ----------------
    // Bip: robozinho ajudante que flutua, casco branco, visor escuro e olhos amarelos
    // (mesmo estilo do Readapt, mas menor e com detalhes amarelos)
    A.mapa('npc_bip', [
        '........................',
        '........................',
        '...........yy...........',
        '...........kk...........',
        '...........kk...........',
        '.......kkkkkkkkkk.......',
        '.....kkwwwwwwwwwwkk.....',
        '....kwwwwwwwwwwwwwwk....',
        '...kwwwwwwwwwwwwwwwwk...',
        '..kykwwkkkkkkkkkkwwkyk..',
        '..kykwkvvvvvvvvvvkwkyk..',
        '..kykwkvvYYvvYYvvkwkyk..',
        '..kykwkvvYYvvYYvvkwkyk..',
        '...kwwkkkkkkkkkkkkwwk...',
        '...kwwwwwwwwwwwwwwwwk...',
        '....kwwwwwwwwwwwwwwk....',
        '.....kkwwwwwwwwwwkk.....',
        '.......kkkkkkkkkk.......',
        '........kgggggggk.......',
        '.........kkkkkkk........',
        '........................',
        '........................',
        '........................',
        '........................',
    ], { k: K, w: '#eef2fa', v: '#0b0f1a', Y: '#ffd23f', y: '#ffd23f', g: '#9fb3d1' },
    2, 'Bip, o robô ajudante (primeira sala)', null, 'w');

    A.mapa('fragmento_memoria', [
        '................',
        '................',
        '......kkkk......',
        '....kkppppkk....',
        '...kppppppppk...',
        '..kppwwppwwppk..',
        '..kppwkppwkppk..',
        '..kppppppppppk..',
        '..kpphpppphppk..',
        '..kppppkkppppk..',
        '...kppppppppk...',
        '....kkppppkk....',
        '......kkkk......',
        '................',
        '................',
        '................',
    ], { k: K, p: '#ff9ad5', w: '#ffffff', h: '#ff5fa2' }, P, 'Fragmento de memória (criatura amigável)', null, 'p');

    A.mapa('crianca', [
        '................',
        '.....kkkkkk.....',
        '....kHHHHHHk....',
        '...kHHHHHHHHk...',
        '...kHssssssHk...',
        '...kskssssksk...',
        '...kssssssssk...',
        '....kssrrssk....',
        '.....kkkkkk.....',
        '....kooooook....',
        '...kooooooook...',
        '...ksoooooosk...',
        '....kooooook....',
        '....kbbkkbbk....',
        '....kbbk.kbbk...',
        '....kkkk.kkkk...',
    ], { k: K, H: '#6b3e1f', s: '#f2c29b', o: '#ff8c1a', b: '#2463eb', r: '#d9485f' }, P, 'A criança (telas de final)', null, 'Hob');

    // ---------------- CORAÇÕES DA HUD ----------------
    const CORACAO = [
        '.kk...kk.',
        'krrk.krrk',
        'krwrkrrrk',
        'krrrrrrrk',
        '.krrrrrk.',
        '..krrrk..',
        '...krk...',
        '....k....',
    ];
    const vazio = CORACAO.map(l => l.replace(/[rw]/g, 'e'));
    const meio = CORACAO.map(l => l.split('').map((ch, x) => (x > 4 && (ch === 'r' || ch === 'w')) ? 'e' : ch).join(''));
    const palCor = { k: K, r: '#ff4d6d', w: '#ffd6de', e: '#3a3f5c' };
    A.mapa('coracao_cheio', CORACAO, palCor, 4, 'Coração cheio (HUD)');
    A.mapa('coracao_meio', meio, palCor, 4, 'Meio coração (HUD e item que cura)');
    A.mapa('coracao_vazio', vazio, palCor, 4, 'Coração vazio (HUD)');

    // ---------------- UPGRADES ----------------
    A.mapa('up_pulso', [
        '................',
        '.....kkkkkk.....',
        '...kkbbbbbbkk...',
        '..kbbbbbyybbbk..',
        '..kbbbbyybbbbk..',
        '.kbbbbyybbbbbbk.',
        '.kbbbyyyyyybbbk.',
        '.kbbbbbbyybbbbk.',
        '.kbbbbbyybbbbbk.',
        '.kbbbbyybbbbbbk.',
        '..kbbyybbbbbbk..',
        '..kbbybbbbbbbk..',
        '...kkbbbbbbkk...',
        '.....kkkkkk.....',
        '................',
        '................',
    ], { k: K, b: '#2463eb', y: '#ffd23f' }, P, 'Upgrade Pulso Forte', null, 'b');

    A.mapa('up_coracao', [
        '................',
        '................',
        '...kkk....kkk...',
        '..krrrk..krrrk..',
        '.krrrrrkkrrrrrk.',
        '.krrrrrrrrrrrrk.',
        '.krrrrrwwrrrrrk.',
        '.krrrrwwwwrrrrk.',
        '..krrrrwwrrrrk..',
        '...krrrrrrrrk...',
        '....krrrrrrk....',
        '.....krrrrk.....',
        '......krrk......',
        '.......kk.......',
        '................',
        '................',
    ], { k: K, r: '#ff4d6d', w: '#ffffff' }, P, 'Upgrade Coração Extra', null, 'r');

    A.add('up_scan', 48, 48, 'Upgrade Escaneamento', (ctx) => {
        ctx.fillStyle = K;
        ctx.beginPath(); ctx.arc(20, 20, 15, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#5ff0ff';
        ctx.beginPath(); ctx.arc(20, 20, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e8f1ff';
        ctx.fillRect(13, 13, 6, 6);
        ctx.fillStyle = K;
        for (let i = 0; i < 5; i++) ctx.fillRect(29 + i * 3, 29 + i * 3, 9, 9);
        ctx.fillStyle = '#ffd23f';
        for (let i = 0; i < 4; i++) ctx.fillRect(31 + i * 3, 31 + i * 3, 5, 5);
    });

    // ---------------- TIROS (gotas, como as lágrimas do Isaac) ----------------
    function gota(ctx, w, cor, brilho) {
        const c = w / 2;
        ctx.fillStyle = K;
        ctx.beginPath(); ctx.arc(c, c, c, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = RD.Arte.tom(cor, -0.25);
        ctx.beginPath(); ctx.arc(c, c, c - 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = cor;
        ctx.beginPath(); ctx.arc(c - 1, c - 1, c - 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = brilho;
        ctx.fillRect(Math.round(c - c * 0.55), Math.round(c - c * 0.55), Math.max(3, Math.round(w / 6)), Math.max(3, Math.round(w / 6)));
    }

    A.add('pulso', 22, 22, 'Tiro do Readapt (gota de energia)', (ctx) => gota(ctx, 22, '#7fd8ff', '#ffffff'));

    A.add('letra_tiro', 26, 26, 'Tiro dos inimigos (uma letra)', (ctx) => {
        gota(ctx, 26, '#e63946', '#ffb3b3');
        texto(ctx, 'Z', 13, 14, 12, '#ffffff', 0, false);
    });

    // ---------------- EFEITOS (não trocáveis) ----------------
    A.add('sombra', 48, 16, 'Sombra embaixo dos personagens', (ctx) => {
        ctx.fillStyle = 'rgba(0,0,0,0.38)';
        ctx.beginPath(); ctx.ellipse(24, 8, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
    }, true);

    A.add('respingo', 30, 30, 'Respingo do tiro', (ctx) => {
        ctx.fillStyle = '#ffffff';
        const r = A.aleatorio(7);
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const d = 9 + r() * 4;
            ctx.fillRect(Math.round(15 + Math.cos(a) * d) - 2, Math.round(15 + Math.sin(a) * d) - 2, 4, 4);
        }
        ctx.fillRect(12, 12, 6, 6);
    }, true);

    A.add('mancha', 60, 60, 'Mancha de tinta no chão', (ctx) => {
        ctx.fillStyle = '#ffffff';
        const r = A.aleatorio(11);
        ctx.beginPath(); ctx.arc(30, 30, 15, 0, Math.PI * 2); ctx.fill();
        for (let i = 0; i < 9; i++) {
            const a = r() * Math.PI * 2;
            const d = 12 + r() * 14;
            ctx.beginPath(); ctx.arc(30 + Math.cos(a) * d, 30 + Math.sin(a) * d, 2 + r() * 5, 0, Math.PI * 2); ctx.fill();
        }
    }, true);

    // ---------------- OBJETOS ----------------
    A.add('bloco_letra', 64, 64, 'Bloco de letra das atividades', (ctx) => {
        ctx.fillStyle = K;
        retArredondado(ctx, 0, 4, 64, 60, 12); ctx.fill();
        ctx.fillStyle = '#d9c9a0';
        retArredondado(ctx, 3, 8, 58, 53, 10); ctx.fill();
        ctx.fillStyle = '#fff4d6';
        retArredondado(ctx, 3, 3, 58, 50, 10); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(10, 8, 12, 4);
    });

    A.add('bloco_silaba', 120, 64, 'Bloco de sílaba das atividades', (ctx) => {
        ctx.fillStyle = K;
        retArredondado(ctx, 0, 4, 120, 60, 12); ctx.fill();
        ctx.fillStyle = '#d9c9a0';
        retArredondado(ctx, 3, 8, 114, 53, 10); ctx.fill();
        ctx.fillStyle = '#fff4d6';
        retArredondado(ctx, 3, 3, 114, 50, 10); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(10, 8, 20, 4);
    });

    A.add('livro', 48, 48, 'Livro brilhante da luta contra o chefe', (ctx) => {
        const g = ctx.createRadialGradient(24, 24, 4, 24, 24, 24);
        g.addColorStop(0, 'rgba(255,220,100,0.7)');
        g.addColorStop(1, 'rgba(255,220,100,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 48, 48);
        ctx.fillStyle = K;
        ctx.fillRect(6, 12, 36, 26);
        ctx.fillStyle = '#2463eb';
        ctx.fillRect(8, 14, 32, 22);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(10, 14, 13, 20);
        ctx.fillRect(25, 14, 13, 20);
        ctx.fillStyle = '#9fb3d1';
        for (let i = 0; i < 4; i++) { ctx.fillRect(12, 18 + i * 4, 9, 2); ctx.fillRect(27, 18 + i * 4, 9, 2); }
        ctx.fillStyle = K;
        ctx.fillRect(23, 13, 2, 23);
    });

    // Portal: anel de pedra com runas de letras brilhando (o miolo fica vazio:
    // o redemoinho 'portal_vortice' gira por baixo). Desenhado pela metade e ampliado 2x.
    A.add('portal', 120, 120, 'Portal: anel de pedra com runas', (ctx) => {
        const S = 60, c = document.createElement('canvas');
        c.width = S; c.height = S;
        const g = c.getContext('2d');
        const cx = 30, cy = 30;
        // anel
        g.fillStyle = K;
        g.beginPath(); g.arc(cx, cy, 29, 0, Math.PI * 2); g.arc(cx, cy, 18, 0, Math.PI * 2, true); g.fill();
        g.fillStyle = '#4a4458';
        g.beginPath(); g.arc(cx, cy, 27.5, 0, Math.PI * 2); g.arc(cx, cy, 19.5, 0, Math.PI * 2, true); g.fill();
        // luz de cima e sombra de baixo nas pedras
        g.fillStyle = '#6d6680';
        g.beginPath(); g.arc(cx, cy, 27.5, Math.PI * 1.05, Math.PI * 1.95); g.arc(cx, cy, 24, Math.PI * 1.95, Math.PI * 1.05, true); g.fill();
        g.fillStyle = '#2f2b3a';
        g.beginPath(); g.arc(cx, cy, 27.5, Math.PI * 0.1, Math.PI * 0.9); g.arc(cx, cy, 24, Math.PI * 0.9, Math.PI * 0.1, true); g.fill();
        // juntas entre as pedras
        g.strokeStyle = K; g.lineWidth = 1;
        for (let k = 0; k < 10; k++) {
            const a = (k / 10) * Math.PI * 2;
            g.beginPath();
            g.moveTo(cx + Math.cos(a) * 19.5, cy + Math.sin(a) * 19.5);
            g.lineTo(cx + Math.cos(a) * 27.5, cy + Math.sin(a) * 27.5);
            g.stroke();
        }
        // runas de letras brilhando em cada pedra
        const runas = 'ABCDELMRSZ';
        for (let k = 0; k < 10; k++) {
            const a = ((k + 0.5) / 10) * Math.PI * 2;
            const x = cx + Math.cos(a) * 23.5, y = cy + Math.sin(a) * 23.5;
            g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2);
            g.font = '700 7px ' + RD.FONTE; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillStyle = 'rgba(95,240,255,0.35)'; g.fillText(runas[k], 0.5, 0.5);
            g.fillStyle = '#9ff6ff'; g.fillText(runas[k], 0, 0);
            g.restore();
        }
        // borda interna brilhando
        g.strokeStyle = '#5ff0ff'; g.lineWidth = 1.5;
        g.beginPath(); g.arc(cx, cy, 18.5, 0, Math.PI * 2); g.stroke();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(c, 0, 0, 120, 120);
    });

    // Redemoinho do portal (gira por baixo do anel)
    A.add('portal_vortice', 80, 80, 'Portal: redemoinho do meio', (ctx) => {
        const S = 40, c = document.createElement('canvas');
        c.width = S; c.height = S;
        const g = c.getContext('2d');
        const cx = 20, cy = 20;
        g.fillStyle = '#1a0b33';
        g.beginPath(); g.arc(cx, cy, 19, 0, Math.PI * 2); g.fill();
        const cores = ['#3b1f7a', '#5a2fb0', '#7a3cff', '#5f9cff', '#5ff0ff', '#c9fbff'];
        for (let braco = 0; braco < 3; braco++) {
            for (let t = 0; t <= 1; t += 0.02) {
                const r = 18 * (1 - t) + 1;
                const a = braco * (Math.PI * 2 / 3) + t * Math.PI * 3;
                const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
                g.fillStyle = cores[Math.min(cores.length - 1, Math.floor(t * cores.length))];
                const tam = 1 + (1 - t) * 3;
                g.fillRect(Math.round(x - tam / 2), Math.round(y - tam / 2), Math.ceil(tam), Math.ceil(tam));
            }
        }
        g.fillStyle = '#ffffff';
        g.fillRect(cx - 2, cy - 2, 4, 4);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(c, 0, 0, 80, 80);
    });

    // Portas em arco de pedra (desenhadas para a parede de cima; o jogo gira para os outros lados)
    function porta(ctx, trancada) {
        // moldura de pedra
        ctx.fillStyle = K;
        retArredondado(ctx, 0, 0, 96, 52, 18); ctx.fill();
        ctx.fillStyle = '#6d6a7a';
        retArredondado(ctx, 3, 3, 90, 48, 16); ctx.fill();
        ctx.fillStyle = '#8f8c9c';
        retArredondado(ctx, 3, 3, 90, 10, 6); ctx.fill();
        ctx.fillStyle = '#4a4756';
        for (let x = 6; x < 90; x += 15) ctx.fillRect(x, 14, 2, 34);
        // abertura escura com profundidade
        ctx.fillStyle = K;
        retArredondado(ctx, 15, 9, 66, 42, 14); ctx.fill();
        const g = ctx.createLinearGradient(0, 12, 0, 48);
        g.addColorStop(0, '#000000');
        g.addColorStop(1, '#16121f');
        ctx.fillStyle = g;
        retArredondado(ctx, 18, 12, 60, 39, 12); ctx.fill();
        if (trancada) {
            ctx.fillStyle = K;
            for (let i = 0; i < 5; i++) ctx.fillRect(22 + i * 12, 12, 7, 39);
            ctx.fillStyle = '#9a96a8';
            for (let i = 0; i < 5; i++) ctx.fillRect(23 + i * 12, 12, 4, 39);
            ctx.fillStyle = K;
            ctx.fillRect(36, 24, 24, 20);
            ctx.fillStyle = '#d9a800';
            ctx.fillRect(38, 26, 20, 16);
            ctx.fillStyle = '#ffd23f';
            ctx.fillRect(38, 26, 20, 5);
            ctx.fillStyle = K;
            ctx.fillRect(46, 31, 4, 7);
        }
    }
    A.add('porta_aberta', 96, 48, 'Porta aberta', (ctx) => porta(ctx, false));
    A.add('porta_trancada', 96, 48, 'Porta trancada', (ctx) => porta(ctx, true));

    // ---------------- CENÁRIOS (escuros, estilo porão) ----------------
    RD.CORES_CENARIO = {
        letras: {
            piso: '#2c3452', pisoEscuro: '#232a44', pisoClaro: '#38416a',
            parede: '#1f2645', paredeClara: '#36427a', paredeEscura: '#111629',
            pedra: '#5a6585', pedraClara: '#7c87a8', pedraEscura: '#3a425c', letraPedra: '#c9a227', letra: 'A',
            mancha: 'rgba(10,12,30,0.35)', tinta: 0x7fd8ff,
        },
        labirinto: {
            piso: '#2f2539', pisoEscuro: '#261d30', pisoClaro: '#3c3049',
            parede: '#3a2350', paredeClara: '#5a3a78', paredeEscura: '#1f122b',
            pedra: '#24766f', pedraClara: '#36a094', pedraEscura: '#164944', letraPedra: '#a8fff2', letra: 'S',
            mancha: 'rgba(15,40,35,0.35)', tinta: 0x5fe0c8,
        },
        nucleo: {
            piso: '#1d1218', pisoEscuro: '#150c11', pisoClaro: '#2a1820',
            parede: '#3b0e19', paredeClara: '#5e1b2c', paredeEscura: '#1e050b',
            pedra: '#45265e', pedraClara: '#653a85', pedraEscura: '#2a163a', letraPedra: '#ff4d6d', letra: '?',
            mancha: 'rgba(60,0,15,0.4)', tinta: 0xff4d6d,
        },
    };

    function tijolos(ctx, c, largura, semente) {
        const r = A.aleatorio(semente);
        ctx.fillStyle = c.paredeEscura;
        ctx.fillRect(0, 0, largura, 48);
        for (let y = 0; y < 48; y += 16) {
            const desloc = (y / 16) % 2 ? 12 : 0;
            for (let x = -desloc; x < largura; x += 24) {
                const v = (r() - 0.5) * 0.16;
                ctx.fillStyle = RD.Arte.tom(c.parede, v);
                ctx.fillRect(x + 2, y + 2, 21, 13);
                ctx.fillStyle = RD.Arte.tom(c.paredeClara, v);
                ctx.fillRect(x + 2, y + 2, 21, 3);
                ctx.fillStyle = RD.Arte.tom(c.parede, -0.3);
                ctx.fillRect(x + 2, y + 12, 21, 3);
            }
        }
    }

    Object.keys(RD.CORES_CENARIO).forEach((id, n) => {
        const c = RD.CORES_CENARIO[id];

        A.add('piso_' + id, 48, 48, 'Piso do cenário ' + id + ' (repete pela sala)', (ctx) => {
            const r = A.aleatorio(101 + n);
            for (let y = 0; y < 48; y += 3) {
                for (let x = 0; x < 48; x += 3) {
                    const v = r();
                    ctx.fillStyle = v < 0.12 ? c.pisoEscuro : v > 0.9 ? c.pisoClaro : c.piso;
                    ctx.fillRect(x, y, 3, 3);
                }
            }
            // juntas bem discretas entre as pedras do chão
            ctx.fillStyle = RD.Arte.tom(c.piso, -0.12);
            ctx.fillRect(0, 45, 48, 3);
            ctx.fillRect(45, 0, 3, 48);
        });

        A.add('parede_' + id, 48, 48, 'Parede do cenário ' + id, (ctx) => tijolos(ctx, c, 48, 201 + n));

        A.add('bloco_' + id, 48, 48, 'Pedra (obstáculo) do cenário ' + id, (ctx) => {
            // pedra irregular com sombreado
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.beginPath(); ctx.ellipse(25, 41, 21, 6, 0, 0, Math.PI * 2); ctx.fill();
            const forma = [[6, 18], [12, 7], [24, 3], [37, 6], [44, 17], [43, 33], [34, 41], [14, 41], [5, 32]];
            const desenhar = (cor, enc) => {
                ctx.fillStyle = cor;
                ctx.beginPath();
                forma.forEach(([x, y], i) => {
                    const px = 24 + (x - 24) * enc, py = 22 + (y - 22) * enc;
                    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                });
                ctx.closePath(); ctx.fill();
            };
            desenhar(K, 1.06);
            desenhar(c.pedraEscura, 1);
            ctx.save();
            ctx.translate(-2, -3);
            desenhar(c.pedra, 0.86);
            ctx.restore();
            ctx.fillStyle = c.pedraClara;
            ctx.fillRect(14, 10, 10, 3);
            ctx.fillRect(11, 13, 4, 6);
            texto(ctx, c.letra, 23, 22, 18, c.letraPedra, -0.15, false);
        });

        A.add('rachada_' + id, 96, 48, 'Parede rachada (esconde sala secreta) do cenário ' + id, (ctx) => {
            tijolos(ctx, c, 96, 301 + n);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(30, 0); ctx.lineTo(40, 14); ctx.lineTo(34, 24); ctx.lineTo(48, 36); ctx.lineTo(44, 48);
            ctx.moveTo(40, 14); ctx.lineTo(56, 18); ctx.lineTo(64, 8);
            ctx.moveTo(48, 36); ctx.lineTo(62, 32); ctx.lineTo(70, 44);
            ctx.stroke();
            ctx.strokeStyle = RD.Arte.tom(c.paredeClara, 0.2);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(32, 0); ctx.lineTo(42, 14); ctx.lineTo(58, 18);
            ctx.stroke();
        });

        // Detalhes do chão da sala inteira: manchas, rachaduras e pedrinhas (não trocável)
        A.add('detalhes_' + id, RD.LARGURA, RD.LINHAS * RD.TILE, 'Detalhes do chão', (ctx, w, h) => {
            const r = A.aleatorio(401 + n);
            for (let i = 0; i < 14; i++) {
                const x = 60 + r() * (w - 120), y = 60 + r() * (h - 120);
                ctx.fillStyle = c.mancha;
                for (let k = 0; k < 6; k++) {
                    ctx.beginPath();
                    ctx.ellipse(x + (r() - 0.5) * 50, y + (r() - 0.5) * 30, 12 + r() * 26, 8 + r() * 16, r() * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.strokeStyle = 'rgba(0,0,0,0.45)';
            ctx.lineWidth = 3;
            for (let i = 0; i < 9; i++) {
                let x = 60 + r() * (w - 120), y = 60 + r() * (h - 120);
                ctx.beginPath(); ctx.moveTo(x, y);
                for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 50; y += (r() - 0.5) * 30; ctx.lineTo(Math.round(x / 3) * 3, Math.round(y / 3) * 3); }
                ctx.stroke();
            }
            for (let i = 0; i < 40; i++) {
                const x = Math.round((60 + r() * (w - 120)) / 3) * 3, y = Math.round((60 + r() * (h - 120)) / 3) * 3;
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(x, y + 3, 6, 3);
                ctx.fillStyle = c.pisoClaro;
                ctx.fillRect(x, y, 6, 3);
            }
        }, true);
    });

    // Sombra das paredes no chão + cantos escurecidos (como no Isaac), não trocável
    A.add('vinheta', RD.LARGURA, RD.LINHAS * RD.TILE, 'Sombra das bordas da sala', (ctx, w, h) => {
        const T = RD.TILE;
        const faixa = (x, y, ww, hh, x0, y0, x1, y1) => {
            const g = ctx.createLinearGradient(x0, y0, x1, y1);
            g.addColorStop(0, 'rgba(0,0,0,0.55)');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.fillRect(x, y, ww, hh);
        };
        faixa(T, T, w - 2 * T, 40, 0, T, 0, T + 40);
        faixa(T, T, 30, h - 2 * T, T, 0, T + 30, 0);
        faixa(w - T - 30, T, 30, h - 2 * T, w - T, 0, w - T - 30, 0);
        faixa(T, h - T - 16, w - 2 * T, 16, 0, h - T, 0, h - T - 16);
        const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.62);
        v.addColorStop(0, 'rgba(0,0,0,0)');
        v.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = v;
        ctx.fillRect(0, 0, w, h);
    }, true);

    // Cantos da tela escurecidos (menu)
    A.add('vinheta_tela', RD.LARGURA, RD.ALTURA, 'Cantos escuros do menu', (ctx, w, h) => {
        const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.6);
        v.addColorStop(0, 'rgba(0,0,0,0)');
        v.addColorStop(1, 'rgba(0,0,0,0.75)');
        ctx.fillStyle = v;
        ctx.fillRect(0, 0, w, h);
    }, true);

    // Pedaço de papel do menu (como o menu desenhado do Isaac)
    A.add('papel', 440, 330, 'Papel do menu principal', (ctx, w, h) => {
        const r = A.aleatorio(77);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        const borda = [];
        for (let i = 0; i <= 20; i++) borda.push([12 + (w - 24) * i / 20, 10 + r() * 8]);
        for (let i = 0; i <= 14; i++) borda.push([w - 10 - r() * 8, 12 + (h - 24) * i / 14]);
        for (let i = 20; i >= 0; i--) borda.push([12 + (w - 24) * i / 20, h - 10 - r() * 8]);
        for (let i = 14; i >= 0; i--) borda.push([10 + r() * 8, 12 + (h - 24) * i / 14]);
        borda.forEach(([x, y], i) => (i ? ctx.lineTo(x + 6, y + 8) : ctx.moveTo(x + 6, y + 8)));
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e9dcbf';
        ctx.beginPath();
        borda.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#6b5a3e';
        ctx.lineWidth = 3;
        ctx.stroke();
        for (let i = 0; i < 9; i++) {
            ctx.fillStyle = 'rgba(140,110,60,0.07)';
            ctx.beginPath(); ctx.ellipse(30 + r() * (w - 60), 30 + r() * (h - 60), 10 + r() * 30, 6 + r() * 16, r() * 3, 0, Math.PI * 2); ctx.fill();
        }
    });

    // ---------------- LUZES E PARTÍCULAS (telas de menu e história, não trocáveis) ----------------
    A.add('faisca', 6, 6, 'Faísca', (ctx) => { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 6, 6); }, true);

    A.add('brilho', 128, 128, 'Brilho redondo', (ctx) => {
        const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 128, 128);
    }, true);

    A.add('feixe', 360, 520, 'Feixe de luz', (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, 'rgba(255,240,200,0.0)');
        g.addColorStop(0.25, 'rgba(255,240,200,0.55)');
        g.addColorStop(1, 'rgba(255,240,200,0.15)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(w * 0.38, 0); ctx.lineTo(w * 0.62, 0); ctx.lineTo(w, h); ctx.lineTo(0, h);
        ctx.closePath(); ctx.fill();
        // bordas suaves
        ctx.globalCompositeOperation = 'destination-out';
        const lados = ctx.createLinearGradient(0, 0, w, 0);
        lados.addColorStop(0, 'rgba(0,0,0,1)');
        lados.addColorStop(0.3, 'rgba(0,0,0,0)');
        lados.addColorStop(0.7, 'rgba(0,0,0,0)');
        lados.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = lados;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
    }, true);

    A.add('nevoa', 320, 160, 'Névoa', (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        g.addColorStop(0, 'rgba(255,255,255,0.5)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.save();
        ctx.scale(1, h / w);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, w);
        ctx.restore();
    }, true);

    A.add('degrade_cima', 16, 256, 'Degradê escuro', (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, 'rgba(7,6,12,1)');
        g.addColorStop(1, 'rgba(7,6,12,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
    }, true);

    // ---------------- ESCURIDÃO (não trocável) ----------------
    function escuridao(raio) {
        return (ctx, w, h) => {
            ctx.fillStyle = 'rgba(5,3,10,0.93)';
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'destination-out';
            const g = ctx.createRadialGradient(w / 2, h / 2, raio * 0.45, w / 2, h / 2, raio);
            g.addColorStop(0, 'rgba(0,0,0,1)');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(w / 2, h / 2, raio, 0, Math.PI * 2); ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        };
    }
    A.add('escuro_sala', 1920, 1312, 'Escuridão das salas', escuridao(260), true);
    A.add('escuro_chefe', 1920, 1312, 'Escuridão do chefe', escuridao(330), true);
})();
