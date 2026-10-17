// Sons retrô gerados por código (sem arquivos) e voz para ler palavras.
RD.Som = {
    ctx: null,
    ligado: true,

    iniciar() {
        try {
            if (localStorage.getItem('readapt_som') === '0') this.ligado = false;
        } catch (e) { /* navegador sem armazenamento: segue com som ligado */ }
    },

    alternar() {
        this.ligado = !this.ligado;
        try { localStorage.setItem('readapt_som', this.ligado ? '1' : '0'); } catch (e) { }
        if (!this.ligado && 'speechSynthesis' in window) window.speechSynthesis.cancel();
        return this.ligado;
    },

    _audio() {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            this.ctx = new AC();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return this.ctx;
    },

    // Um "bip": frequência inicial, duração, tipo de onda, volume, frequência final
    tom(freq, dur, tipo, vol, freqFim, atraso) {
        const ctx = this._audio();
        if (!ctx) return;
        const t0 = ctx.currentTime + (atraso || 0);
        const osc = ctx.createOscillator();
        const ganho = ctx.createGain();
        osc.type = tipo || 'square';
        osc.frequency.setValueAtTime(freq, t0);
        if (freqFim) osc.frequency.linearRampToValueAtTime(freqFim, t0 + dur);
        ganho.gain.setValueAtTime(vol || 0.05, t0);
        ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(ganho);
        ganho.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
    },

    tocar(nome) {
        if (!this.ligado) return;
        try {
            switch (nome) {
                case 'tiro': this.tom(700, 0.07, 'square', 0.025, 480); break;
                case 'acerto': this.tom(260, 0.06, 'square', 0.04, 160); break;
                case 'restaurar': this.tom(520, 0.08, 'triangle', 0.06, 900); break;
                case 'dano': this.tom(200, 0.18, 'sawtooth', 0.05, 90); break;
                case 'porta': this.tom(330, 0.1, 'triangle', 0.06, 500); this.tom(500, 0.12, 'triangle', 0.06, 660, 0.1); break;
                case 'certo': this.tom(660, 0.09, 'triangle', 0.07); this.tom(880, 0.14, 'triangle', 0.07, null, 0.09); break;
                case 'erro': this.tom(300, 0.12, 'triangle', 0.06, 240); break;
                case 'item': [523, 659, 784, 1046].forEach((f, i) => this.tom(f, 0.12, 'triangle', 0.06, null, i * 0.08)); break;
                case 'segredo': [392, 523, 659].forEach((f, i) => this.tom(f, 0.15, 'sine', 0.07, null, i * 0.1)); break;
                case 'bloqueado': this.tom(150, 0.06, 'square', 0.03); break;
                case 'portal': this.tom(300, 0.6, 'sine', 0.06, 900); break;
                case 'passo': this.tom(150, 0.07, 'triangle', 0.05, 110); break;
                case 'chefe': this.tom(110, 0.5, 'sawtooth', 0.05, 70); break;
                case 'vitoria': [523, 659, 784, 1046, 784, 1046].forEach((f, i) => this.tom(f, 0.18, 'triangle', 0.07, null, i * 0.14)); break;
                case 'derrota': [392, 330, 262].forEach((f, i) => this.tom(f, 0.25, 'triangle', 0.06, null, i * 0.22)); break;
                case 'menu': this.tom(600, 0.05, 'triangle', 0.04); break;
                case 'fala': this.tom(440 + Math.random() * 120, 0.03, 'square', 0.015); break;
            }
        } catch (e) { /* som é opcional */ }
    },

    // Lê uma palavra em voz alta (se o navegador tiver voz em português)
    // ------------------------------------------------------------------
    // VOZ que lê as palavras
    // 1) Se existir uma gravação em assets/vozes/<palavra>.mp3, ela é usada
    //    (ex.: assets/vozes/gato.mp3). Fica com voz de gente de verdade.
    // 2) Se não existir, o navegador lê com a voz mais natural que tiver
    //    em português do Brasil (as vozes "Natural" do Edge e a do Google
    //    no Chrome são as melhores).
    // ------------------------------------------------------------------
    vozesBoas: [
        'francisca', 'thalita', 'antonio', 'natural', 'online',   // Edge (vozes neurais)
        'google português do brasil', 'google portugues do brasil', // Chrome
        'luciana', 'felipe',                                        // Mac / iPhone
        'maria', 'daniel',                                          // Windows (mais robóticas)
    ],

    escolherVoz() {
        if (!('speechSynthesis' in window)) return null;
        const todas = window.speechSynthesis.getVoices();
        const pt = todas.filter(v => /^pt[-_]BR/i.test(v.lang));
        const lista = pt.length ? pt : todas.filter(v => /^pt/i.test(v.lang));
        if (!lista.length) return null;
        const nota = (v) => {
            const n = v.name.toLowerCase();
            const i = this.vozesBoas.findIndex(p => n.includes(p));
            let pontos = i < 0 ? 100 : i;
            if (n.includes('natural') || n.includes('online')) pontos -= 50;   // vozes neurais primeiro
            return pontos;
        };
        lista.sort((x, y) => nota(x) - nota(y));
        return lista[0];
    },

    falar(texto) {
        if (!this.ligado || !texto) return false;
        const nome = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_');
        // gravação de verdade, se existir
        if (this.gravacoes[nome] !== false) {
            if (this.audio) { this.audio.pause(); }
            const a = new Audio('assets/vozes/' + nome + '.mp3');
            this.audio = a;
            a.onerror = () => { this.gravacoes[nome] = false; this.falarSintetizado(texto); };
            a.play().then(() => { this.gravacoes[nome] = true; }).catch(() => {});
            return true;
        }
        return this.falarSintetizado(texto);
    },
    gravacoes: {},

    falarSintetizado(texto) {
        if (!('speechSynthesis' in window)) return false;
        try {
            window.speechSynthesis.cancel();
            const fala = new SpeechSynthesisUtterance(texto.toLowerCase());
            if (!this.voz) this.voz = this.escolherVoz();
            if (this.voz) fala.voice = this.voz;
            fala.lang = this.voz ? this.voz.lang : 'pt-BR';
            // vozes naturais já falam devagar e claro; as antigas ficam melhores um pouco mais lentas
            const natural = this.voz && /natural|online|google/i.test(this.voz.name);
            fala.rate = natural ? 0.9 : 0.8;
            fala.pitch = 1.05;
            window.speechSynthesis.speak(fala);
            return true;
        } catch (e) {
            return false;
        }
    },
};

RD.Som.iniciar();
// a lista de vozes chega depois que a página abre
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => { RD.Som.voz = RD.Som.escolherVoz(); };
    RD.Som.voz = RD.Som.escolherVoz();
}
