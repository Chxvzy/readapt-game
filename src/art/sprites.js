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

    sobDemanda: {},          // desenhos que só são feitos quando o jogo precisa deles
    registrandoSobDemanda: false,

    // Registra um desenho livre (feito com o canvas)
    add(chave, largura, altura, uso, desenhar, naoTrocavel) {
        const s = { chave, largura, altura, uso, desenhar, naoTrocavel: !!naoTrocavel };
        if (this.registrandoSobDemanda) this.sobDemanda[chave] = s;
        else this.lista.push(s);
    },

    // Desenha agora uma textura "sob demanda" (se ainda não existir)
    garantir(cena, chave) {
        if (cena.textures.exists(chave)) return chave;
        const s = this.sobDemanda[chave];
        if (!s) return chave;
        const tex = cena.textures.createCanvas(s.chave, s.largura, s.altura);
        const ctx = tex.getContext();
        ctx.imageSmoothingEnabled = false;
        s.desenhar(ctx, s.largura, s.altura);
        tex.refresh();
        return chave;
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

    // ---------------- PINTOR DE PIXEL ----------------
    // Ajuda a desenhar sprites maiores (24x24) com formas: elipses, retângulos,
    // letras pequenas e contorno automático. Cada caractere é uma cor da paleta.
    const FONTE5 = {
        A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
        B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
        R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
        S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
        Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
        Q: ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
        E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
        D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
        P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
        d: ['....#', '....#', '.####', '#...#', '#...#', '#...#', '.####'],
        b: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '####.'],
        // versões menores (4 x 6)
        dp: ['...#', '...#', '.###', '#..#', '#..#', '.###'],
        bp: ['#...', '#...', '###.', '#..#', '#..#', '###.'],
    };
    const Pintor = {
        grade(w, h) { return Array.from({ length: h }, () => Array(w).fill('.')); },
        elipse(g, cx, cy, rx, ry, ch) {
            for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) {
                const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
                if (dx * dx + dy * dy <= 1) g[y][x] = ch;
            }
        },
        ret(g, x, y, w, h, ch) {
            for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j] && i >= 0 && i < g[0].length) g[j][i] = ch;
        },
        px(g, x, y, ch) { if (g[y] && x >= 0 && x < g[0].length) g[y][x] = ch; },
        // letra 5x7; "inclina" desloca as linhas para o lado (letra torta)
        letra(g, l, x, y, ch, inclina, espelho) {
            const m = FONTE5[l]; if (!m) return;
            m.forEach((linha, j) => {
                const d = inclina ? Math.round((3 - j) * inclina) : 0;
                const n = linha.length;
                for (let i = 0; i < n; i++) {
                    const c = espelho ? linha[n - 1 - i] : linha[i];
                    if (c === '#') Pintor.px(g, x + i + d, y + j, ch);
                }
            });
        },
        // contorno escuro em volta de tudo que foi pintado
        contorno(g) {
            const c = g.map(l => l.slice());
            for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) {
                if (g[y][x] !== '.') continue;
                const viz = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g[y + dy] && g[y + dy][x + dx] && g[y + dy][x + dx] !== '.');
                if (viz) c[y][x] = 'k';
            }
            return c;
        },
        texto(g) { return g.map(l => l.join('')); },
    };
    RD.Pintor = Pintor;
    // texturas feitas em tamanho dobrado (para ficarem nítidas) e a escala para mostrá-las
    RD.Arte.escalas = RD.Arte.escalas || {};

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
    // Letra Torta: criatura vermelha corcunda com uma letra R torta cravada nas costas,
    // olhos bravos e boca com dentes.
    (function () {
        const g = Pintor.grade(24, 24);
        Pintor.elipse(g, 12, 15, 9.5, 7.5, 'r');           // corpo
        Pintor.elipse(g, 11, 11, 7.5, 6, 'r');             // cabeça
        Pintor.ret(g, 5, 20, 4, 3, 'r'); Pintor.ret(g, 15, 20, 4, 3, 'r'); // pés
        Pintor.ret(g, 6, 9, 3, 4, 'e'); Pintor.ret(g, 13, 9, 3, 4, 'e');   // olhos
        Pintor.px(g, 6, 9, 'w'); Pintor.px(g, 13, 9, 'w');
        Pintor.ret(g, 5, 7, 4, 1, 'e'); Pintor.ret(g, 13, 7, 4, 1, 'e');   // sobrancelhas
        Pintor.px(g, 8, 8, 'e'); Pintor.px(g, 13, 8, 'e');
        Pintor.ret(g, 7, 15, 8, 3, 'e');                                    // boca
        [7, 9, 11, 13].forEach(x => Pintor.px(g, x, 15, 'w'));
        [8, 10, 12, 14].forEach(x => Pintor.px(g, x, 17, 'w'));
        Pintor.ret(g, 16, 17, 2, 1, 'd');                                   // manchinha
        const gc = Pintor.contorno(g);
        Pintor.letra(gc, 'R', 15, 0, 'y', 0.4);            // a letra torta cravada nas costas
        for (let y = 0; y < 9; y++) for (let x = 13; x < 24; x++) {   // contorno só por fora da letra
            if (gc[y][x] === '.' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => gc[y + dy] && gc[y + dy][x + dx] === 'y')) gc[y][x] = 'k';
        }
        A.mapa('letra_torta', Pintor.texto(gc),
            { k: K, r: '#c8323c', y: '#f0c75e', e: '#14142b', w: '#ffffff', d: '#8e1f2a' },
            2, 'Inimigo Letra Torta', null, 'r');
    })();

    // Sílaba Quebrada: corpo laranja partido ao meio (d | b), remendado com faixas
    (function () {
        const g = Pintor.grade(24, 24);
        Pintor.elipse(g, 7.5, 13, 6.5, 9, 'o');
        Pintor.elipse(g, 16.5, 13, 6.5, 9, 'o');
        for (let y = 3; y < 23; y++) Pintor.px(g, 11 + ((y >> 1) % 2), y, '.');   // rachadura em zigue-zague
        for (let y = 3; y < 23; y++) Pintor.px(g, 12 - ((y >> 1) % 2), y, '.');
        Pintor.ret(g, 4, 8, 3, 3, 'e'); Pintor.px(g, 4, 8, 'w');                 // um olho de cada lado
        Pintor.ret(g, 17, 8, 3, 3, 'e'); Pintor.px(g, 17, 8, 'w');
        // "d" e "b" (as letras que mais se confundem), no meio de cada metade
        Pintor.letra(g, 'dp', 4, 12, 'c', 0, true);   // espelhadas
        Pintor.letra(g, 'bp', 16, 12, 'c', 0, true);
        Pintor.ret(g, 9, 6, 6, 2, 't'); Pintor.ret(g, 9, 18, 6, 2, 't');        // faixas de remendo
        Pintor.ret(g, 4, 22, 3, 2, 'o'); Pintor.ret(g, 17, 22, 3, 2, 'o');
        A.mapa('silaba_quebrada', Pintor.texto(Pintor.contorno(g)),
            { k: K, o: '#e07a1f', e: '#14142b', w: '#ffffff', c: '#fff1d6', t: '#d9c9a0' },
            2, 'Inimigo Sílaba Quebrada (d | b)', null, 'ot');
    })();

    // Pedaço da Sílaba: meia criatura, com um olho e a letra
    (function () {
        const g = Pintor.grade(15, 15);
        Pintor.elipse(g, 7.5, 8, 6.5, 6.5, 'o');
        Pintor.ret(g, 10, 1, 4, 14, '.');
        for (let y = 2; y < 14; y++) Pintor.px(g, 10 - ((y >> 1) % 2), y, '.');
        Pintor.ret(g, 3, 4, 3, 3, 'e'); Pintor.px(g, 3, 4, 'w');
        Pintor.ret(g, 3, 9, 4, 1, 'c'); Pintor.ret(g, 4, 10, 2, 2, 'c');
        A.mapa('silaba_pedaco', Pintor.texto(Pintor.contorno(g)),
            { k: K, o: '#f0a040', e: '#14142b', w: '#ffffff', c: '#fff1d6' },
            2, 'Pedaço da Sílaba Quebrada', null, 'o');
    })();

    // Palavra Embaralhada: um livro-monstro aberto, com olhos nas páginas e boca de dentes
    (function () {
        const g = Pintor.grade(24, 24);
        Pintor.ret(g, 1, 4, 22, 16, 'g');                   // capa
        Pintor.ret(g, 3, 5, 8, 13, 'p'); Pintor.ret(g, 13, 5, 8, 13, 'p'); // páginas
        Pintor.ret(g, 11, 4, 2, 16, 'b');                   // lombada
        [[4, 6], [6, 6], [8, 6], [14, 6], [17, 6], [19, 6], [4, 15], [7, 15], [15, 15], [18, 15]].forEach(([x, y]) => Pintor.ret(g, x, y, 2, 1, 'l'));
        Pintor.ret(g, 5, 8, 3, 3, 'e'); Pintor.px(g, 5, 8, 'w');      // olhos
        Pintor.ret(g, 16, 8, 3, 3, 'e'); Pintor.px(g, 16, 8, 'w');
        Pintor.ret(g, 4, 7, 4, 1, 'e'); Pintor.ret(g, 16, 7, 4, 1, 'e');
        Pintor.ret(g, 4, 12, 16, 3, 'e');                              // boca
        for (let x = 4; x < 20; x += 2) { Pintor.px(g, x, 12, 'w'); Pintor.px(g, x + 1, 14, 'w'); }
        Pintor.ret(g, 16, 20, 2, 3, 'r');                              // fitinha marcadora
        Pintor.px(g, 16, 23, 'r');
        A.mapa('palavra_embaralhada', Pintor.texto(Pintor.contorno(g)),
            { k: K, g: '#2f6b46', b: '#1f4a30', p: '#efe6cf', l: '#8a8070', e: '#14142b', w: '#ffffff', r: '#c8323c' },
            2, 'Inimigo Palavra Embaralhada (livro que atira letras)', null, 'gp');
    })();

    // Criatura da Confusão: fantasminha pálido, olhos de tamanhos diferentes,
    // a barra rasgada e um ponto de interrogação roxo em cima da cabeça
    (function () {
        const g = Pintor.grade(24, 24);
        const Y = 3;                                         // corpo mais para baixo (espaço pro "?")
        Pintor.elipse(g, 12, 10 + Y, 9, 8.5, 't');
        Pintor.ret(g, 3, 10 + Y, 18, 9, 't');
        for (let x = 3; x < 21; x++) {                       // barra rasgada
            const alt = [2, 1, 1, 2, 2, 1][x % 6];
            Pintor.ret(g, x, 19 + Y, 1, alt, 't');
        }
        Pintor.ret(g, 6, 7 + Y, 4, 5, 'e'); Pintor.px(g, 6, 7 + Y, 'w');      // olho grande
        Pintor.ret(g, 15, 9 + Y, 2, 3, 'e'); Pintor.px(g, 15, 9 + Y, 'w');    // olho pequeno
        Pintor.ret(g, 9, 14 + Y, 2, 1, 'e'); Pintor.ret(g, 11, 15 + Y, 2, 1, 'e'); Pintor.ret(g, 13, 14 + Y, 2, 1, 'e'); // boca torta
        const gc = Pintor.contorno(g);
        // "?" saindo do alto da cabeça, com contorno próprio
        const interrog = ['.###.', '#...#', '...#.', '..#..', '.....', '..#..'];
        interrog.forEach((linha, j) => { for (let i = 0; i < 5; i++) if (linha[i] === '#') gc[j][11 + i] = 'q'; });
        for (let y = 0; y < 8; y++) for (let x = 9; x < 18; x++) {
            if (gc[y][x] === 'q') continue;
            const viz = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => gc[y + dy] && gc[y + dy][x + dx] === 'q');
            if (viz) gc[y][x] = 'k';
        }
        A.mapa('criatura_confusao', Pintor.texto(gc),
            { k: K, t: '#d9d4f2', e: '#14142b', w: '#ffffff', q: '#8f5cff' },
            2, 'Inimigo Criatura da Confusão (fantasma que muda de lugar)', null, 't');
    })();

    // ---------------- CHEFE ----------------
    // A Dislexia: uma nuvem enorme de letras roxas emboladas, com dois olhos
    // vermelhos brilhando no meio. Desenhada em metade do tamanho e ampliada 2x
    // (pixel art). Nenhuma letra encosta na borda, então nada fica cortado.
    A.add('chefe_dislexia', 168, 168, 'Chefe final: a Dislexia (nuvem de letras)', (ctx) => {
        const S = 84;
        const tela = document.createElement('canvas');
        tela.width = S; tela.height = S;
        const c = tela.getContext('2d');
        const r = A.aleatorio(4242);
        const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZbdpq?';
        // formato da nuvem: um "corpo" no meio e dois braços caídos dos lados
        const bolhas = [
            [42, 36, 30, 24], [18, 44, 15, 21], [66, 44, 15, 21],
            [10, 60, 8, 14], [74, 61, 8, 14], [30, 58, 15, 12], [54, 58, 15, 12],
        ];
        const dentro = (x, y, folga) => bolhas.some(([bx, by, rx, ry]) => {
            const dx = (x - bx) / Math.max(1, rx - folga), dy = (y - by) / Math.max(1, ry - folga);
            return dx * dx + dy * dy <= 1;
        });
        const letra = (l, x, y, tam, cor, ang, espelho) => {
            c.save(); c.translate(x, y); c.rotate(ang); c.scale(espelho ? -1 : 1, 1);
            c.font = '700 ' + tam + 'px ' + RD.FONTE;
            c.textAlign = 'center'; c.textBaseline = 'middle';
            c.lineWidth = 2.5; c.strokeStyle = '#140a28'; c.strokeText(l, 0, 0);
            c.fillStyle = cor; c.fillText(l, 0, 0);
            c.restore();
        };

        // miolo escuro (para não aparecer o chão entre as letras)
        c.fillStyle = '#170b2c';
        bolhas.forEach(([bx, by, rx, ry]) => { c.beginPath(); c.ellipse(bx, by, rx - 3, ry - 3, 0, 0, Math.PI * 2); c.fill(); });

        // várias camadas: as de trás mais escuras, as da frente mais claras
        const camadas = [
            { qtd: 45, tam: [15, 18], cores: ['#3d2275', '#462884', '#4f2d94'] },
            { qtd: 40, tam: [13, 16], cores: ['#5a33a8', '#6338b6', '#6c3fc4'] },
            { qtd: 32, tam: [11, 14], cores: ['#7a4fd6', '#8558e0', '#7148cc'] },
            { qtd: 18, tam: [10, 12], cores: ['#9a74f0', '#a886ff', '#8d66e8'] },
        ];
        camadas.forEach((cam) => {
            let feitas = 0, tentativas = 0;
            while (feitas < cam.qtd && tentativas < 2000) {
                tentativas++;
                const tam = cam.tam[0] + Math.floor(r() * (cam.tam[1] - cam.tam[0] + 1));
                const m = Math.ceil(tam * 0.55) + 1;                // a letra inteira cabe na tela
                const x = m + r() * (S - 2 * m), y = m + r() * (S - 2 * m);
                if (!dentro(x, y, tam * 0.3)) continue;
                if (cam.qtd < 40 && Math.abs(y - 36) < 8 && Math.abs(x - 42) < 18) continue;   // deixa os olhos à mostra
                // letras de cima pegam mais luz
                const cor = cam.cores[Math.floor(r() * cam.cores.length)];
                letra(letras[Math.floor(r() * letras.length)], x, y, tam, y < 34 ? RD.Arte.tom(cor, 0.12) : cor,
                    (r() - 0.5) * 2.2, r() < 0.3);
                feitas++;
            }
        });

        // buraco escuro onde ficam os olhos
        c.fillStyle = '#0d0618';
        c.beginPath(); c.ellipse(42, 36, 15, 7, 0, 0, Math.PI * 2); c.fill();

        // olhos redondos vermelhos (mesmos lugares usados pelo brilho no menu e na história)
        [[33, 36], [51, 36]].forEach(([ex, ey]) => {
            c.fillStyle = '#120822'; c.beginPath(); c.arc(ex, ey, 5, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#ff3355'; c.beginPath(); c.arc(ex, ey, 4, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#ff8fa3'; c.fillRect(ex - 2, ey - 2, 2, 2);
        });

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tela, 0, 0, 168, 168);
        // brilho suave em volta dos olhos
        [[66, 72], [102, 72]].forEach(([ex, ey]) => {
            const gr = ctx.createRadialGradient(ex, ey, 6, ex, ey, 20);
            gr.addColorStop(0, 'rgba(255,60,90,0.45)');
            gr.addColorStop(1, 'rgba(255,60,90,0)');
            ctx.fillStyle = gr;
            ctx.fillRect(ex - 20, ey - 20, 40, 40);
        });
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
    // Blocos das atividades: placas de pedra encantadas, com moldura dourada e
    // a face funda e escura onde a letra brilha (a letra é escrita pelo jogo)
    function placaRuna(largura) {
        const W = largura / 2, H = 32;
        const g = Pintor.grade(W, H);
        // corpo de pedra com cantos arredondados + lateral de baixo (dá volume)
        Pintor.ret(g, 2, 1, W - 4, H - 4, 's');
        Pintor.ret(g, 1, 2, W - 2, H - 6, 's');
        Pintor.ret(g, 2, H - 7, W - 4, 4, 'd');
        Pintor.ret(g, 1, H - 7, W - 2, 3, 'd');
        Pintor.ret(g, 3, 2, W - 6, 1, 'h');                  // luz na borda de cima
        // face funda onde fica a letra
        Pintor.ret(g, 5, 5, W - 10, H - 14, 'f');
        Pintor.ret(g, 5, 5, W - 10, 1, 'e');                 // sombra interna em cima
        Pintor.ret(g, 5, 5, 1, H - 14, 'e');
        // cantoneiras douradas
        [[1, 2], [W - 4, 2], [1, H - 10], [W - 4, H - 10]].forEach(([x, y]) => {
            Pintor.ret(g, x, y, 3, 3, 'o');
            Pintor.px(g, x + (x < 3 ? 0 : 2), y, 'O');
        });
        // risquinhos e lascas na pedra
        const r = A.aleatorio(largura + 7);
        for (let n = 0; n < W / 4; n++) {
            const x = 6 + Math.floor(r() * (W - 12));
            Pintor.px(g, x, r() < 0.5 ? 3 : H - 8, 'd');
        }
        return Pintor.texto(Pintor.contorno(g));
    }
    const PAL_PLACA = { k: K, s: '#4a4466', h: '#6e6894', d: '#2a2540', f: '#16132a', e: '#0d0b1a', o: '#c9a227', O: '#ffe58a' };
    A.mapa('bloco_letra', placaRuna(64), PAL_PLACA, 2, 'Placa de pedra com letra (atividades)', null, 's');
    A.mapa('bloco_silaba', placaRuna(120), PAL_PLACA, 2, 'Placa de pedra com sílaba (atividades)', null, 's');

    // Letras das atividades no estilo dos objetos do Isaac: a própria letra é
    // um objeto grosso de pedra-osso parado no chão, com lateral (volume),
    // contorno preto, luz em cima e lascas. Gerada na hora para cada letra ou
    // sílaba em ALTA resolução (o dobro do tamanho no jogo), para ficar nítida:
    // quem usa a textura mostra ela com escala 0.5.
    RD.Arte.ESCALA_LETRA = 0.5;
    // "unica": cada bloco ganha rachaduras e lascas só dele (nenhuma letra igual à outra)
    RD.Arte.contLetra = 0;
    RD.Arte.letra3D = function (cena, valor, unica) {
        const chave = 'letra3d_' + valor + (unica ? '_' + (++RD.Arte.contLetra) : '');
        if (cena.textures.exists(chave)) return chave;
        const S = 4;                                   // 4 pontos por unidade (= pixels reais da tela)
        const silaba = valor.length > 1;
        const tam = (silaba ? 22 : 27) * S, prof = 5 * S;
        const fonte = '700 ' + tam + 'px ' + RD.FONTE;
        // mede a letra de verdade para a imagem ter o tamanho certo (nada cortado)
        const medidor = document.createElement('canvas').getContext('2d');
        medidor.font = fonte;
        const med = medidor.measureText(valor);
        const margem = 5 * S;                          // espaço para contorno e lascas
        const largLetra = med.actualBoundingBoxLeft + med.actualBoundingBoxRight;
        const altLetra = med.actualBoundingBoxAscent + med.actualBoundingBoxDescent;
        const W = Math.ceil(largLetra + margem * 2), H = Math.ceil(altLetra + prof + margem * 2);
        const xLetra = margem + med.actualBoundingBoxLeft;          // onde a letra é escrita
        const yBase = margem + med.actualBoundingBoxAscent;
        const cx = margem + largLetra / 2, cy = margem + altLetra / 2;  // meio da letra
        const novaTela = () => { const t = document.createElement('canvas'); t.width = W; t.height = H; return t; };
        const r = unica ? Math.random : A.aleatorio(valor.charCodeAt(0) * 31 + valor.length);

        // 1) FORMA da letra, já com os pedacinhos quebrados. Tudo (contorno,
        //    lateral e frente) é feito a partir dela, então o contorno segue a quebra.
        const forma = novaTela();
        const fm = forma.getContext('2d');
        fm.font = fonte; fm.textAlign = 'left'; fm.textBaseline = 'alphabetic';
        fm.fillStyle = '#000'; fm.fillText(valor, xLetra, yBase);
        const px = fm.getImageData(0, 0, W, H).data;
        const cheio = (x, y) => x >= 0 && y >= 0 && x < W && y < H && px[(Math.floor(y) * W + Math.floor(x)) * 4 + 3] > 128;
        fm.globalCompositeOperation = 'destination-out';
        // lascas em lados sorteados (cima, baixo, esquerda ou direita), em
        // quantidade e tamanho diferentes em cada letra
        const totalLascas = (silaba ? 2 : 1) + Math.floor(r() * 3);
        let lascas = 0;
        for (let tent = 0; tent < 80 && lascas < totalLascas; tent++) {
            const lado = Math.floor(r() * 4);          // 0 cima, 1 baixo, 2 esquerda, 3 direita
            let x, y, dx = 0, dy = 0;
            if (lado < 2) {
                x = Math.floor(W * 0.1 + r() * W * 0.8);
                y = lado === 0 ? 0 : H - 1; dy = lado === 0 ? 1 : -1;
            } else {
                y = Math.floor(H * 0.15 + r() * H * 0.6);
                x = lado === 2 ? 0 : W - 1; dx = lado === 2 ? 1 : -1;
            }
            while (x >= 0 && y >= 0 && x < W && y < H && !cheio(x, y)) { x += dx; y += dy; }
            if (!cheio(x, y)) continue;
            // triângulo torto entrando na letra a partir da borda achada
            // tamanho limitado: a lasca nunca muda a letra (um O não pode virar Q)
            const l = (1.4 + r() * 2) * S;
            const fundo = l * (0.6 + r() * 0.6);
            const giro = (r() - 0.5) * 0.9;
            const ang = Math.atan2(dy, dx) + giro;               // direção "para dentro"
            const px1 = -Math.sin(ang), py1 = Math.cos(ang);      // perpendicular
            fm.beginPath();
            fm.moveTo(x - dx * S + px1 * l, y - dy * S + py1 * l);
            fm.lineTo(x - dx * S - px1 * l * (0.5 + r() * 0.7), y - dy * S - py1 * l * (0.5 + r() * 0.7));
            fm.lineTo(x + Math.cos(ang) * fundo, y + Math.sin(ang) * fundo);
            fm.closePath(); fm.fill();
            lascas++;
        }
        fm.globalCompositeOperation = 'source-over';

        // pinta a forma de uma cor (mantendo o formato)
        const colorir = (cor) => {
            const t = novaTela(); const g = t.getContext('2d');
            g.drawImage(forma, 0, 0);
            g.globalCompositeOperation = 'source-in';
            g.fillStyle = cor; g.fillRect(0, 0, W, H);
            return t;
        };

        // 2) FRENTE: degradê, pintinhas e rachaduras
        const frente = colorir('#e9ddc2');
        const f = frente.getContext('2d');
        f.globalCompositeOperation = 'source-atop';
        const gr = f.createLinearGradient(0, cy - altLetra * 0.5, 0, cy + altLetra * 0.5);
        gr.addColorStop(0, '#fff7e3'); gr.addColorStop(0.45, '#eadfc4'); gr.addColorStop(1, '#c4b28b');
        f.fillStyle = gr; f.fillRect(0, 0, W, H);
        for (let i = 0; i < (silaba ? 26 : 14); i++) {
            f.fillStyle = r() < 0.6 ? 'rgba(120,100,70,0.55)' : 'rgba(255,255,255,0.5)';
            f.fillRect(Math.floor(r() * W), Math.floor(r() * H), S, S);
        }
        const rachar = (x, y, ang, passos, grossura) => {
            const pontos = [[x, y]];
            for (let i = 0; i < passos; i++) {
                ang += (r() - 0.5) * 1.3;
                const tamPasso = (3 + r() * 4) * S;
                x += Math.cos(ang) * tamPasso; y += Math.sin(ang) * tamPasso;
                pontos.push([x, y]);
                if (r() < 0.3) {
                    const a2 = ang + (r() < 0.5 ? 1 : -1) * (0.7 + r() * 0.6);
                    const l2 = (2 + r() * 3) * S;
                    f.strokeStyle = 'rgba(45,32,18,0.9)'; f.lineWidth = grossura * 0.6;
                    f.beginPath(); f.moveTo(x, y); f.lineTo(x + Math.cos(a2) * l2, y + Math.sin(a2) * l2); f.stroke();
                }
            }
            const linha = (dx, dy, cor, larg) => {
                f.strokeStyle = cor; f.lineWidth = larg;
                f.beginPath(); pontos.forEach(([qx, qy], i) => (i ? f.lineTo(qx + dx, qy + dy) : f.moveTo(qx + dx, qy + dy))); f.stroke();
            };
            linha(S * 0.6, S * 0.6, 'rgba(255,248,225,0.7)', grossura * 0.7);
            linha(0, 0, 'rgba(40,28,14,0.95)', grossura);
        };
        f.lineCap = 'round'; f.lineJoin = 'round';
        const totalRach = (silaba ? 2 : 1) + Math.floor(r() * 3);
        for (let i = 0; i < totalRach; i++) {
            const lado = Math.floor(r() * 4);
            const larg = silaba ? W * 0.35 : tam * 0.45;
            const x0 = lado === 2 ? cx - larg : lado === 3 ? cx + larg : cx + (r() - 0.5) * larg * 1.6;
            const y0 = lado === 0 ? cy - tam * 0.45 : lado === 1 ? cy + tam * 0.4 : cy + (r() - 0.5) * tam * 0.7;
            const ang = [Math.PI / 2, -Math.PI / 2, 0, Math.PI][lado] + (r() - 0.5) * 1.1;
            rachar(x0, y0, ang, 2 + Math.floor(r() * 4), S * (0.7 + r() * 0.8));
        }
        // contorno fino por dentro da frente (separa da lateral)
        f.globalCompositeOperation = 'source-over';

        // 3) MONTA: contorno preto (a forma "engordada"), lateral e frente
        const tela = novaTela();
        const c = tela.getContext('2d');
        const preto = colorir('#0b0912');
        const raio = 1.75 * S;
        for (let d = prof; d >= 0; d -= 2) {
            for (let k = 0; k < 16; k++) {
                const a = (k / 16) * Math.PI * 2;
                c.drawImage(preto, Math.cos(a) * raio, d + Math.sin(a) * raio);
            }
        }
        const lado1 = colorir('#55462f'), lado2 = colorir('#76654a'), fio = colorir('#9c8a68');
        for (let d = prof; d >= 1; d--) c.drawImage(d > prof * 0.55 ? lado1 : lado2, 0, d);
        c.drawImage(fio, 0, S * 0.6);
        c.drawImage(frente, 0, 0);

        const t = cena.textures.createCanvas(chave, W, H);
        t.getContext().drawImage(tela, 0, 0);
        t.refresh();
        t.setFilter(Phaser.Textures.FilterMode.LINEAR);
        return chave;
    };

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

    // Porta do chefe: moldura de carne-pedra vermelha com chifres, uma boca
    // de dentes em volta da abertura e luz vermelha lá dentro
    function portaChefe(ctx, trancada) {
        ctx.fillStyle = K;
        retArredondado(ctx, 0, 0, 96, 52, 18); ctx.fill();
        ctx.fillStyle = '#5e1b2c';
        retArredondado(ctx, 3, 3, 90, 48, 16); ctx.fill();
        ctx.fillStyle = '#8e2a3e';
        retArredondado(ctx, 3, 3, 90, 10, 6); ctx.fill();
        // veias / rachaduras na moldura
        ctx.fillStyle = '#3b0e19';
        [[8, 16, 2, 10], [10, 25, 2, 8], [84, 14, 2, 12], [86, 27, 2, 9], [5, 36, 6, 2], [85, 40, 6, 2]].forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));
        // chifres nos cantos (apontando para fora da sala)
        const chifre = (x, dir) => {
            ctx.fillStyle = K;
            ctx.beginPath(); ctx.moveTo(x, 12); ctx.lineTo(x + dir * 14, 12); ctx.lineTo(x + dir * 3, -2); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#e8dcc0';
            ctx.beginPath(); ctx.moveTo(x + dir * 2, 10); ctx.lineTo(x + dir * 11, 10); ctx.lineTo(x + dir * 4, 1); ctx.closePath(); ctx.fill();
        };
        chifre(4, 1); chifre(92, -1);
        // abertura
        ctx.fillStyle = K;
        retArredondado(ctx, 15, 9, 66, 42, 14); ctx.fill();
        const g = ctx.createLinearGradient(0, 12, 0, 50);
        g.addColorStop(0, trancada ? '#1a0508' : '#2a0610');
        g.addColorStop(1, trancada ? '#3a0a14' : '#c0283f');
        ctx.fillStyle = g;
        retArredondado(ctx, 18, 12, 60, 39, 12); ctx.fill();
        // dentes em cima e embaixo da abertura (a porta é uma boca)
        ctx.fillStyle = '#f2ead8';
        for (let x = 20; x < 76; x += 8) {
            ctx.beginPath(); ctx.moveTo(x, 12); ctx.lineTo(x + 7, 12); ctx.lineTo(x + 3.5, 19); ctx.closePath(); ctx.fill();
        }
        for (let x = 24; x < 72; x += 8) {
            ctx.beginPath(); ctx.moveTo(x, 51); ctx.lineTo(x + 7, 51); ctx.lineTo(x + 3.5, 45); ctx.closePath(); ctx.fill();
        }
        if (trancada) {
            // a boca fechada: dentes trancados no meio
            ctx.fillStyle = '#f2ead8';
            for (let x = 20; x < 76; x += 8) {
                ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x + 7, 20); ctx.lineTo(x + 3.5, 34); ctx.closePath(); ctx.fill();
            }
            for (let x = 24; x < 72; x += 8) {
                ctx.beginPath(); ctx.moveTo(x, 44); ctx.lineTo(x + 7, 44); ctx.lineTo(x + 3.5, 30); ctx.closePath(); ctx.fill();
            }
        } else {
            // olhinhos vermelhos lá no fundo
            ctx.fillStyle = '#ff3355';
            ctx.fillRect(38, 30, 5, 4); ctx.fillRect(53, 30, 5, 4);
        }
    }
    A.add('porta_chefe', 96, 48, 'Porta que leva ao chefe', (ctx) => portaChefe(ctx, false));
    A.add('porta_chefe_trancada', 96, 48, 'Porta do chefe fechada', (ctx) => portaChefe(ctx, true));

    // ---------------- CENÁRIOS (escuros, estilo porão) ----------------
    RD.CORES_CENARIO = {
        letras: {
            piso: '#2c3452', pisoEscuro: '#232a44', pisoClaro: '#38416a',
            parede: '#1f2645', paredeClara: '#36427a', paredeEscura: '#111629',
            pedra: '#5a6585', pedraClara: '#7c87a8', pedraEscura: '#3a425c', letraPedra: '#353d57', letra: 'A',
            mancha: 'rgba(10,12,30,0.35)', tinta: 0x7fd8ff,
        },
        labirinto: {
            piso: '#2f2539', pisoEscuro: '#261d30', pisoClaro: '#3c3049',
            parede: '#3a2350', paredeClara: '#5a3a78', paredeEscura: '#1f122b',
            pedra: '#24766f', pedraClara: '#36a094', pedraEscura: '#164944', letraPedra: '#0f3a36', letra: 'S',
            mancha: 'rgba(15,40,35,0.35)', tinta: 0x5fe0c8,
        },
        nucleo: {
            piso: '#1d1218', pisoEscuro: '#150c11', pisoClaro: '#2a1820',
            parede: '#3b0e19', paredeClara: '#5e1b2c', paredeEscura: '#1e050b',
            pedra: '#45265e', pedraClara: '#653a85', pedraEscura: '#2a163a', letraPedra: '#ff4d6d', letra: 'E',
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

        // Pedra (obstáculo): rocha com volume, rachaduras e uma letra gravada.
        // No Labirinto tem musgo; no Núcleo a letra brilha em vermelho.
        // Pedras: 5 formatos diferentes x 26 letras (A a Z). O jogo sorteia o formato
        // e a letra de cada pedra; cada combinação só é desenhada quando aparece.
        RD.LETRAS_PEDRA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        RD.FORMAS_PEDRA = 5;
        const formaPedra = (forma) => {
            const g = Pintor.grade(24, 24);
            const r = A.aleatorio(700 + forma * 13 + n);
            if (forma === 0) {            // pedra irregular (a original)
                Pintor.elipse(g, 12, 14, 10.5, 8.5, 's');
                Pintor.elipse(g, 9, 10, 7, 6, 's');
                Pintor.elipse(g, 16, 11, 5.5, 5, 's');
            } else if (forma === 1) {     // pedregulho redondo
                Pintor.elipse(g, 12, 13.5, 10, 9.5, 's');
            } else if (forma === 2) {     // rocha alta e pontuda
                Pintor.elipse(g, 12, 16, 8.5, 7, 's');
                Pintor.elipse(g, 11, 10, 6, 7.5, 's');
                Pintor.elipse(g, 13.5, 5.5, 3, 4, 's');
            } else if (forma === 3) {     // laje larga e baixa
                Pintor.elipse(g, 12, 16, 11, 6, 's');
                Pintor.elipse(g, 10, 12.5, 8, 5, 's');
                Pintor.elipse(g, 16, 13, 5, 4, 's');
            } else {                      // pedra partida em duas
                Pintor.elipse(g, 7.5, 14.5, 6.5, 8, 's');
                Pintor.elipse(g, 16.5, 13.5, 6.5, 9, 's');
                for (let y = 2; y < 24; y++) Pintor.px(g, 12 - ((y >> 1) % 2), y, '.');
            }
            // brilho no alto e à esquerda, rachaduras e lasquinhas sorteadas
            let topo = 24, esq = 24;
            for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) if (g[y][x] === 's') { topo = Math.min(topo, y); esq = Math.min(esq, x); }
            Pintor.ret(g, esq + 3, topo + 2, 3, 1, 'h'); Pintor.ret(g, esq + 2, topo + 3, 1, 2, 'h');
            for (let k = 0; k < 2; k++) {
                let x = 4 + Math.floor(r() * 16), y = 6 + Math.floor(r() * 12);
                for (let p = 0; p < 3 + Math.floor(r() * 3); p++) {
                    if (g[y] && g[y][x] === 's') Pintor.px(g, x, y, 'x');
                    x += Math.round(r() * 2 - 1); y += 1;
                }
            }
            if (id === 'labirinto') {
                for (let k = 0; k < 9; k++) {
                    const x = Math.floor(r() * 24), y = Math.floor(r() * 24);
                    if (g[y][x] === 's' && (!g[y - 1] || g[y - 1][x] !== 's' || r() < 0.3)) Pintor.px(g, x, y, 'u');
                }
            }
            return Pintor.texto(Pintor.contorno(g));
        };
        const desenharLetraPedra = (letra) => (ctx) => {
            // letra gravada na pedra, na fonte OpenDyslexic, centralizada pelos
            // pixels da pedra: um fio de luz embaixo e a letra funda por cima
            const dados = ctx.getImageData(0, 0, 48, 48).data;
            let x0 = 48, y0 = 48, x1 = 0, y1 = 0;
            for (let y = 0; y < 48; y++) for (let x = 0; x < 48; x++) {
                if (dados[(y * 48 + x) * 4 + 3] > 0) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
            }
            ctx.font = '700 17px ' + RD.FONTE_DISLEXIA;
            ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
            const m = ctx.measureText(letra);
            const larg = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
            const alt = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
            const lx = Math.round((x0 + x1 + 1) / 2 - larg / 2 + m.actualBoundingBoxLeft - 0.5);
            const ly = Math.round((y0 + y1 + 1) / 2 + alt / 2 - m.actualBoundingBoxDescent - 0.5);
            ctx.fillStyle = c.pedraClara; ctx.fillText(letra, lx + 1, ly + 1);
            ctx.fillStyle = c.letraPedra; ctx.fillText(letra, lx, ly);
            // sombra no chão por baixo da pedra
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath(); ctx.ellipse(24, 42, 21, 5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        };
        const palPedra = { k: K, s: c.pedra, h: c.pedraClara, x: c.pedraEscura, L: c.letraPedra, u: '#4f9a4a' };
        // pedra "padrão" (usada nos ícones do menu)
        A.mapa('bloco_' + id, formaPedra(0), palPedra, 2, 'Pedra (obstáculo) do cenário ' + id, desenharLetraPedra(c.letra), 's');
        // todas as combinações, desenhadas só quando aparecem no jogo
        A.registrandoSobDemanda = true;
        for (let forma = 0; forma < RD.FORMAS_PEDRA; forma++) {
            const mapaForma = formaPedra(forma);
            RD.LETRAS_PEDRA.forEach((letra) => {
                A.mapa('bloco_' + id + '_' + forma + '_' + letra, mapaForma, palPedra, 2,
                    'Pedra formato ' + forma + ', letra ' + letra + ' (' + id + ')', desenharLetraPedra(letra), 's');
            });
        }
        A.registrandoSobDemanda = false;

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

        // Detalhes do chão (versão padrão do cenário; cada sala gera a sua no jogo)
        A.add('detalhes_' + id, RD.LARGURA, RD.LINHAS * RD.TILE, 'Detalhes do chão', (ctx, w, h) => {
            RD.Arte.desenharDetalhes(ctx, w, h, id, 401 + n);
        }, true);
    });

    // ---------------- ESCADA PARA O PRÓXIMO ANDAR ----------------
    // Um buraco no chão com borda de pedra e degraus descendo para o escuro
    // (leva para o próximo cenário, como descer para o porão).
    Object.keys(RD.CORES_CENARIO).forEach((id) => {
        const c = RD.CORES_CENARIO[id];
        const N = 48;
        const g = Pintor.grade(N, N);
        // borda de pedra com cantos lascados
        Pintor.ret(g, 2, 3, N - 4, N - 6, 's');
        Pintor.ret(g, 3, 2, N - 6, N - 4, 's');
        [[2, 3], [N - 3, 3], [2, N - 4], [N - 3, N - 4]].forEach(([x, y]) => Pintor.px(g, x, y, '.'));
        // juntas entre as pedras da borda
        for (let x = 8; x < N - 4; x += 8) { Pintor.ret(g, x, 2, 1, 5, 'j'); Pintor.ret(g, x - 4, N - 7, 1, 5, 'j'); }
        for (let y = 9; y < N - 6; y += 8) { Pintor.ret(g, 2, y, 5, 1, 'j'); Pintor.ret(g, N - 7, y - 4, 5, 1, 'j'); }
        // buraco escuro
        Pintor.ret(g, 7, 7, N - 14, N - 14, 'e');
        // degraus: cada um mais estreito e mais escuro, sumindo no fundo
        const passos = 5;
        for (let i = 0; i < passos; i++) {
            const y = 7 + i * 6, inset = i * 2;
            const x0 = 9 + inset, w = N - 18 - inset * 2;
            Pintor.ret(g, x0, y, w, 2, String(i + 1));        // pisada (parte de cima, mais clara)
            Pintor.ret(g, x0, y + 2, w, 4, 'abcde'[i]);       // espelho do degrau (mais escuro)
            Pintor.px(g, x0, y, 'e'); Pintor.px(g, x0 + w - 1, y, 'e');
        }
        // sombra das paredes do buraco sobre os degraus
        Pintor.ret(g, 7, 7, 2, N - 14, 'e'); Pintor.ret(g, N - 9, 7, 2, N - 14, 'e');
        // pedrinhas soltas na borda
        [[5, 5, 'h'], [N - 6, 6, 'h'], [6, N - 6, 'x'], [N - 5, N - 5, 'x'], [24, 4, 'h']].forEach(([x, y, ch]) => Pintor.px(g, x, y, ch));
        // a borda usa as cores da parede do próprio mapa
        const pal = {
            k: K, s: c.paredeClara, j: c.paredeEscura, h: RD.Arte.tom(c.paredeClara, 0.25), x: c.paredeEscura, e: '#05040a',
        };
        for (let i = 0; i < passos; i++) {
            const f = -0.15 - i * 0.17;
            pal[String(i + 1)] = RD.Arte.tom(c.pedraClara, f);
            pal['abcde'[i]] = RD.Arte.tom(c.pedraEscura, f - 0.1);
        }
        // uma versão para cada lado: o degrau de cima fica virado para a porta de entrada
        const girar = {
            cima: (m) => m,
            baixo: (m) => m.map((l, y) => l.map((_, x) => m[N - 1 - y][N - 1 - x])),
            direita: (m) => m.map((l, y) => l.map((_, x) => m[N - 1 - x][y])),
            esquerda: (m) => m.map((l, y) => l.map((_, x) => m[x][N - 1 - y])),
        };
        const base = Pintor.contorno(g);
        Object.keys(girar).forEach((lado) => {
            A.mapa('escada_' + id + '_' + lado, Pintor.texto(girar[lado](base)), pal, 2,
                'Buraco com escada para o próximo cenário (' + id + ', entrada por ' + lado + ')', (ctx, w, h) => {
                    // escuridão subindo do fundo do buraco (do lado oposto à entrada)
                    const m = 14;
                    const ini = { cima: [0, m, 0, h - m], baixo: [0, h - m, 0, m], esquerda: [m, 0, w - m, 0], direita: [w - m, 0, m, 0] }[lado];
                    const gr = ctx.createLinearGradient(ini[0], ini[1], ini[2], ini[3]);
                    gr.addColorStop(0, 'rgba(5,4,10,0)');
                    gr.addColorStop(0.55, 'rgba(5,4,10,0.35)');
                    gr.addColorStop(1, 'rgba(5,4,10,0.95)');
                    ctx.fillStyle = gr;
                    ctx.fillRect(m + 4, m + 4, w - 2 * m - 8, h - 2 * m - 8);
                    // sombra no chão em volta
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = 'rgba(0,0,0,0.35)';
                    ctx.fillRect(2, 6, w - 2, h - 4);
                    ctx.globalCompositeOperation = 'source-over';
                }, 's');
        });
    });

    // ---------------- PORTAS ----------------
    // Arco de pedra com as cores da parede de cada andar (pilares de tijolo,
    // pedras do arco e uma pedra-chave com um ponto dourado). Aberta: corredor
    // escuro com um degrau de pedra. Trancada: portas de madeira com faixas
    // de ferro e um cadeado dourado. Desenhadas para a porta de CIMA
    // (o jogo gira para os outros lados).
    function mapaPorta(trancada) {
        // 48 x 24 (x2 = 96 x 48): exatamente do tamanho de um pedaço de parede
        const W = 48, H = 24;
        const g = Pintor.grade(W, H);
        Pintor.ret(g, 0, 0, W, H, 'p');
        // juntas dos tijolos nos pilares
        for (let y = 4; y < H; y += 5) { Pintor.ret(g, 0, y, 9, 1, 'j'); Pintor.ret(g, W - 9, y, 9, 1, 'j'); }
        for (let y = 0; y < H; y += 5) {
            const d = (y / 5) % 2 ? 3 : 6;
            Pintor.ret(g, d, y, 1, 4, 'j'); Pintor.ret(g, W - 1 - d, y, 1, 4, 'j');
        }
        // pedras do arco
        Pintor.ret(g, 8, 3, W - 16, 4, 'a');
        Pintor.ret(g, 8, 3, 3, H - 3, 'a'); Pintor.ret(g, W - 11, 3, 3, H - 3, 'a');
        [13, 18, 29, 34].forEach(x => Pintor.ret(g, x, 3, 1, 4, 'j'));
        [10, 15, 20].forEach(y => { Pintor.ret(g, 8, y, 3, 1, 'j'); Pintor.ret(g, W - 11, y, 3, 1, 'j'); });
        // pedra-chave com ponto dourado
        Pintor.ret(g, 20, 0, 8, 7, 'c');
        Pintor.ret(g, 20, 0, 8, 1, 'C');
        Pintor.ret(g, 22, 2, 4, 3, 'o'); Pintor.ret(g, 22, 2, 4, 1, 'O');
        // abertura com topo arredondado
        Pintor.ret(g, 11, 7, W - 22, H - 7, 'e');
        [[11, 7], [12, 7], [11, 8], [W - 12, 7], [W - 13, 7], [W - 12, 8]].forEach(([x, y]) => Pintor.px(g, x, y, 'a'));
        // bases dos pilares
        Pintor.ret(g, 0, H - 3, 11, 3, 'b'); Pintor.ret(g, W - 11, H - 3, 11, 3, 'b');
        Pintor.ret(g, 0, H - 3, 11, 1, 'B'); Pintor.ret(g, W - 11, H - 3, 11, 1, 'B');
        if (!trancada) {
            // vão vazio: aparece o próprio chão da sala, com uma sombra que vai
            // do escuro (lá fora) até sumir no chão (desenhada depois)
            Pintor.ret(g, 11, 7, W - 22, H - 7, '.');
            [[11, 7], [12, 7], [11, 8], [W - 12, 7], [W - 13, 7], [W - 12, 8]].forEach(([x, y]) => Pintor.px(g, x, y, 'a'));
        } else {
            // duas folhas de madeira
            Pintor.ret(g, 12, 8, W - 24, H - 8, 'w');
            for (let x = 15; x < W - 12; x += 4) Pintor.ret(g, x, 8, 1, H - 8, 'W');
            Pintor.ret(g, 23, 8, 2, H - 8, 'e');
            [11, 20].forEach(y => {
                Pintor.ret(g, 12, y, W - 24, 2, 'i');
                for (let x = 14; x < W - 12; x += 5) Pintor.px(g, x, y, 'I');
            });
            // cadeado
            Pintor.ret(g, 20, 14, 8, 6, 'o');
            Pintor.ret(g, 20, 14, 8, 1, 'O');
            Pintor.ret(g, 21, 12, 6, 2, 'i'); Pintor.ret(g, 22, 13, 4, 1, 'e');
            Pintor.ret(g, 23, 16, 2, 3, 'e');
        }
        return Pintor.texto(g);
    }
    const paletaPorta = (c) => ({
        // mesmas cores da parede da sala, só um pouquinho mais claras na moldura
        k: K, p: c.parede, j: c.paredeEscura, a: RD.Arte.tom(c.parede, 0.1),
        c: RD.Arte.tom(c.paredeClara, -0.05), C: c.paredeClara,
        b: RD.Arte.tom(c.parede, 0.14), B: c.paredeClara,
        o: '#d9a800', O: '#ffe58a', e: '#050409', f: '#0e0c16', g: '#1a1726',
        h: RD.Arte.tom(c.pedra, -0.05), H: RD.Arte.tom(c.pedraClara, 0.15),
        w: '#6b4423', W: '#3e2612', i: '#2b2d38', I: '#9aa0b5',
    });
    // sombra no vão da porta aberta: preta lá fora e sumindo até o fim, no chão da sala
    function sombraVao(ctx, w, h) {
        const x0 = 22, x1 = w - 22, y0 = 14;
        const gr = ctx.createLinearGradient(0, y0, 0, h);
        gr.addColorStop(0, 'rgba(4,3,8,1)');
        gr.addColorStop(0.45, 'rgba(4,3,8,0.75)');
        gr.addColorStop(1, 'rgba(4,3,8,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(x0, y0, x1 - x0, h - y0);
        // cantinhos de sombra dos lados do vão
        const lado = ctx.createLinearGradient(x0, 0, x0 + 8, 0);
        lado.addColorStop(0, 'rgba(4,3,8,0.6)'); lado.addColorStop(1, 'rgba(4,3,8,0)');
        ctx.fillStyle = lado; ctx.fillRect(x0, y0, 8, h - y0);
        const lado2 = ctx.createLinearGradient(x1, 0, x1 - 8, 0);
        lado2.addColorStop(0, 'rgba(4,3,8,0.6)'); lado2.addColorStop(1, 'rgba(4,3,8,0)');
        ctx.fillStyle = lado2; ctx.fillRect(x1 - 8, y0, 8, h - y0);
    }
    Object.keys(RD.CORES_CENARIO).forEach((id) => {
        const c = RD.CORES_CENARIO[id];
        A.mapa('porta_aberta_' + id, mapaPorta(false), paletaPorta(c), 2, 'Porta aberta (' + id + ')', sombraVao, 'pab');
        A.mapa('porta_trancada_' + id, mapaPorta(true), paletaPorta(c), 2, 'Porta trancada (' + id + ')', null, 'pabw');
    });
    // versões "padrão" (usadas nos ícones do menu e do final)
    A.mapa('porta_aberta', mapaPorta(false), paletaPorta(RD.CORES_CENARIO.letras), 2, 'Porta aberta', sombraVao, 'pab');
    A.mapa('porta_trancada', mapaPorta(true), paletaPorta(RD.CORES_CENARIO.letras), 2, 'Porta trancada', null, 'pabw');

    // ---------------- DECORAÇÃO DAS SALAS (tema dislexia) ----------------
    // Objetos só de enfeite (não têm colisão): livros com letras espelhadas,
    // folhas rabiscadas, cubos de alfabeto, lápis quebrado, régua de leitura
    // colorida, velas e letrinhas confundíveis (b, d, p, q) caídas no chão.
    (function () {
        const PAL = {
            k: K, p: '#e9dcbf', P: '#c9b98f', g: '#8a7a5a', l: '#6b5a40', b: '#2a2440',
            c: '#7a2a3a', C: '#a84458', v: '#2f6b46', V: '#4d9a6a', a: '#2b4c8a', A: '#4a74c0',
            m: '#b07a3a', M: '#d9a25a', y: '#e8b923', Y: '#ffd95a', r: '#d24a4a', w: '#f2ead8',
            n: '#3a2a1a', f: '#ff9a3a', F: '#ffe08a', t: '#5fd0ff', T: '#a8ecff',
        };
        const fazer = (chave, w, h, desenho, uso, sombra) => {
            const g = Pintor.grade(w, h);
            desenho(g);
            A.mapa(chave, Pintor.texto(Pintor.contorno(g)), PAL, 2, uso, null, sombra || '');
        };
        const letrinha = (g, forma, x, y, cor) => forma.forEach((linha, j) => {
            for (let i = 0; i < linha.length; i++) if (linha[i] === '#') Pintor.px(g, x + i, y + j, cor);
        });
        const B = ['#..', '#..', '##.', '#.#', '##.'], D = ['..#', '..#', '.##', '#.#', '.##'];
        const Pm = ['##.', '#.#', '##.', '#..', '#..'], Q = ['.##', '#.#', '.##', '..#', '..#'];

        // livro aberto: "b" numa página e "d" (espelhado) na outra
        fazer('deco_livro', 18, 12, (g) => {
            Pintor.ret(g, 1, 2, 16, 9, 'c');
            Pintor.ret(g, 2, 1, 6, 9, 'p'); Pintor.ret(g, 10, 1, 6, 9, 'p');
            Pintor.ret(g, 8, 1, 2, 10, 'g');
            [3, 5].forEach(y => { Pintor.ret(g, 3, y + 4, 4, 1, 'P'); Pintor.ret(g, 11, y + 4, 4, 1, 'P'); });
            letrinha(g, B, 4, 2, 'b'); letrinha(g, D, 12, 2, 'b');
        }, 'Enfeite: livro aberto com b e d');

        // pilha de livros coloridos
        fazer('deco_pilha', 16, 14, (g) => {
            Pintor.ret(g, 2, 10, 13, 3, 'a'); Pintor.ret(g, 2, 10, 13, 1, 'A'); Pintor.ret(g, 13, 11, 1, 2, 'p');
            Pintor.ret(g, 1, 6, 12, 4, 'v'); Pintor.ret(g, 1, 6, 12, 1, 'V'); Pintor.ret(g, 1, 7, 1, 3, 'p');
            Pintor.ret(g, 3, 2, 11, 4, 'c'); Pintor.ret(g, 3, 2, 11, 1, 'C'); Pintor.ret(g, 12, 3, 1, 3, 'p');
            Pintor.px(g, 6, 8, 'y'); Pintor.px(g, 7, 8, 'y'); Pintor.px(g, 7, 4, 'y'); Pintor.px(g, 8, 4, 'y');
        }, 'Enfeite: pilha de livros', 'avc');

        // folha de papel com rabiscos e um "p" e um "q"
        fazer('deco_folha', 12, 14, (g) => {
            Pintor.ret(g, 1, 1, 10, 12, 'p');
            Pintor.px(g, 10, 1, '.'); Pintor.px(g, 9, 1, 'P'); Pintor.px(g, 10, 2, 'P');
            [3, 5, 9, 11].forEach(y => Pintor.ret(g, 2, y, 4 + (y % 3), 1, 'g'));
            letrinha(g, Pm, 7, 4, 'l'); letrinha(g, Q, 3, 7, 'l');
        }, 'Enfeite: folha com p e q');

        // cubo de alfabeto (de brinquedo) com a letra "d"
        fazer('deco_cubo', 13, 13, (g) => {
            Pintor.ret(g, 1, 1, 11, 11, 'm');
            Pintor.ret(g, 1, 9, 11, 3, 'n');
            Pintor.ret(g, 2, 2, 9, 7, 'M');
            letrinha(g, D, 5, 3, 'r');
        }, 'Enfeite: cubo de alfabeto com d', 'm');

        // lápis quebrado em dois pedaços
        fazer('deco_lapis', 18, 7, (g) => {
            Pintor.ret(g, 1, 2, 7, 3, 'y'); Pintor.ret(g, 1, 2, 7, 1, 'Y'); Pintor.ret(g, 1, 2, 2, 3, 'r');
            Pintor.ret(g, 10, 3, 4, 3, 'y'); Pintor.ret(g, 10, 3, 4, 1, 'Y');
            Pintor.ret(g, 14, 3, 2, 3, 'M'); Pintor.px(g, 16, 4, 'b');
        }, 'Enfeite: lápis quebrado');

        // régua de leitura colorida (ajuda a ler uma linha por vez)
        fazer('deco_regua', 20, 7, (g) => {
            Pintor.ret(g, 1, 1, 18, 5, 't');
            Pintor.ret(g, 1, 1, 18, 1, 'T');
            for (let x = 3; x < 18; x += 3) Pintor.ret(g, x, 4, 1, 2, 'a');
        }, 'Enfeite: régua de leitura colorida');

        // vela com pingos de cera
        fazer('deco_vela', 8, 15, (g) => {
            Pintor.ret(g, 2, 6, 4, 8, 'w'); Pintor.ret(g, 1, 12, 6, 2, 'p');
            Pintor.px(g, 2, 7, 'p'); Pintor.px(g, 5, 9, 'p');
            Pintor.ret(g, 3, 1, 2, 4, 'f'); Pintor.px(g, 3, 2, 'F'); Pintor.px(g, 4, 3, 'F'); Pintor.px(g, 4, 5, 'n');
        }, 'Enfeite: vela');

        // letrinhas que se confundem caídas no chão
        [['b', B], ['d', D], ['p', Pm], ['q', Q]].forEach(([nome, forma]) => {
            fazer('deco_letra_' + nome, 6, 8, (g) => letrinha(g, forma, 1, 1, 'w'), 'Enfeite: letra ' + nome);
        });
    })();

    // ---------------- PLAQUINHA ----------------
    // Plaquinha pequena de madeira com um papel pregado (o jogo escreve o nome por cima)
    (function () {
        // 52 x 30 (x2 = 104 x 60); o papel vai de x 6 a 98 e de y 4 a 32
        const W = 52, H = 30;
        const g = Pintor.grade(W, H);
        Pintor.ret(g, 24, 18, 4, 11, 'P');                   // poste
        Pintor.ret(g, 24, 18, 1, 11, 'p');
        Pintor.ret(g, 22, 28, 8, 2, 'P');                    // base
        Pintor.ret(g, 1, 1, W - 2, 18, 'm');                 // tábua
        Pintor.ret(g, 1, 10, W - 2, 1, 'M');
        Pintor.ret(g, 1, 17, W - 2, 2, 'M');
        Pintor.ret(g, 3, 2, W - 6, 14, 'f');                 // papel
        Pintor.ret(g, 3, 2, W - 6, 1, 'F');
        Pintor.px(g, W - 4, 15, 'r'); Pintor.px(g, W - 5, 15, 'r'); Pintor.px(g, W - 4, 14, 'r');
        [[4, 3], [W - 5, 3]].forEach(([x, y]) => Pintor.px(g, x, y, 'n'));
        A.mapa('placa', Pintor.texto(Pintor.contorno(g)),
            { k: K, m: '#8a5a32', M: '#5e3a1e', P: '#4a2e17', p: '#6b4423', f: '#efe2c0', F: '#fff6dd', r: '#c9b78e', n: '#3a2a1a' },
            2, 'Plaquinha de madeira (texto escrito pelo jogo)', null, 'm');
    })();

    // Desenha manchas, rachaduras, pedrinhas e outros detalhes no chão.
    // A "semente" muda tudo: cada sala tem uma semente diferente.
    RD.Arte.desenharDetalhes = function (ctx, w, h, id, semente) {
        const c = RD.CORES_CENARIO[id];
        const r = A.aleatorio(semente);
        const dentro = (m) => [m + r() * (w - 2 * m), m + r() * (h - 2 * m)];
        // manchas
        const nManchas = 6 + Math.floor(r() * 10);
        for (let i = 0; i < nManchas; i++) {
            const [x, y] = dentro(70);
            ctx.fillStyle = c.mancha;
            const partes = 3 + Math.floor(r() * 5);
            for (let k = 0; k < partes; k++) {
                ctx.beginPath();
                ctx.ellipse(x + (r() - 0.5) * 60, y + (r() - 0.5) * 36, 10 + r() * 28, 7 + r() * 18, r() * 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        // rachaduras (às vezes uma bem grande com galhos)
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 3;
        const nRach = 3 + Math.floor(r() * 8);
        for (let i = 0; i < nRach; i++) {
            let [x, y] = dentro(70);
            const passos = r() < 0.25 ? 9 : 3 + Math.floor(r() * 3);
            ctx.beginPath(); ctx.moveTo(x, y);
            for (let k = 0; k < passos; k++) {
                x += (r() - 0.5) * 60; y += (r() - 0.5) * 36;
                ctx.lineTo(Math.round(x / 3) * 3, Math.round(y / 3) * 3);
                if (r() < 0.3) { ctx.moveTo(x, y); ctx.lineTo(x + (r() - 0.5) * 30, y + (r() - 0.5) * 20); ctx.moveTo(x, y); }
            }
            ctx.stroke();
        }
        // brilho vermelho dentro das rachaduras no Núcleo
        if (id === 'nucleo') {
            ctx.strokeStyle = 'rgba(255,60,90,0.25)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                let [x, y] = dentro(80);
                ctx.beginPath(); ctx.moveTo(x, y);
                for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 50; y += (r() - 0.5) * 30; ctx.lineTo(x, y); }
                ctx.stroke();
            }
        }
        // musgo no Labirinto
        if (id === 'labirinto') {
            for (let i = 0; i < 6; i++) {
                const [x, y] = dentro(60);
                ctx.fillStyle = 'rgba(70,140,70,0.18)';
                for (let k = 0; k < 8; k++) ctx.fillRect(Math.round((x + (r() - 0.5) * 40) / 3) * 3, Math.round((y + (r() - 0.5) * 24) / 3) * 3, 6, 3);
            }
        }
        // letras arranhadas no chão
        const nLetras = Math.floor(r() * 4);
        ctx.font = '700 26px ' + RD.FONTE_DISLEXIA;
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        for (let i = 0; i < nLetras; i++) {
            const [x, y] = dentro(90);
            ctx.save(); ctx.translate(x, y); ctx.rotate((r() - 0.5) * 1.2);
            ctx.fillText('ABDEPRSZ'[Math.floor(r() * 8)], 0, 0);
            ctx.restore();
        }
        // teias de aranha nos cantos (algumas salas)
        [[48, 48, 1, 1], [w - 48, 48, -1, 1], [48, h - 48, 1, -1], [w - 48, h - 48, -1, -1]].forEach(([x, y, sx, sy]) => {
            if (r() > 0.35) return;
            ctx.strokeStyle = 'rgba(220,220,235,0.18)';
            ctx.lineWidth = 1;
            for (let k = 0; k < 5; k++) {
                const a = (k / 4) * (Math.PI / 2);
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sx * Math.cos(a) * 60, y + sy * Math.sin(a) * 60); ctx.stroke();
            }
            for (let raio = 15; raio <= 55; raio += 14) {
                ctx.beginPath();
                for (let k = 0; k <= 4; k++) {
                    const a = (k / 4) * (Math.PI / 2);
                    const px = x + sx * Math.cos(a) * raio, py = y + sy * Math.sin(a) * raio;
                    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                }
                ctx.stroke();
            }
        });
        // pedrinhas
        const nPedras = 20 + Math.floor(r() * 35);
        for (let i = 0; i < nPedras; i++) {
            const [px, py] = dentro(60);
            const x = Math.round(px / 3) * 3, y = Math.round(py / 3) * 3;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(x, y + 3, 6, 3);
            ctx.fillStyle = c.pisoClaro;
            ctx.fillRect(x, y, 6, 3);
        }
    };

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
