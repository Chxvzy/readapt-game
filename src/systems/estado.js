// Guarda o progresso da partida: vida, upgrades, salas, atividades e segredos.
RD.Estado = {
    novo() {
        return {
            vida: RD.REGRAS.vidaInicial,
            vidaMax: RD.REGRAS.vidaInicial,
            upgrades: [],
            cenario: 0,
            sala: null,
            limpas: {},        // salas já limpas
            atividades: {},    // atividades concluídas
            segredos: {},      // salas secretas encontradas
            visitadas: {},
            itens: {},         // itens já pegos
            conversas: {},     // presentes já recebidos
            chefeDerrotado: false,
            checkpoint: null,
        };
    },

    comecar() {
        RD.estado = this.novo();
        this.salvarCheckpoint();
    },

    // Ponto de volta para "Tentar de novo"
    salvarCheckpoint() {
        const copia = JSON.parse(JSON.stringify(RD.estado));
        copia.checkpoint = null;
        RD.estado.checkpoint = copia;
    },

    voltarCheckpoint() {
        const c = RD.estado && RD.estado.checkpoint;
        if (!c) { this.comecar(); return; }
        const novo = JSON.parse(JSON.stringify(c));
        novo.vida = novo.vidaMax; // volta com a vida cheia
        novo.checkpoint = c;
        RD.estado = novo;
    },

    chave(indiceCenario, sala) {
        return RD.CENARIOS[indiceCenario].id + ':' + sala;
    },

    tem(upgrade) {
        return RD.estado.upgrades.indexOf(upgrade) >= 0;
    },

    ganharUpgrade(id) {
        if (this.tem(id)) return;
        RD.estado.upgrades.push(id);
        if (id === 'coracao_extra') {
            RD.estado.vidaMax += 2;
            RD.estado.vida = RD.estado.vidaMax;
        }
    },

    // Conta tudo o que existe nos mapas e o que já foi feito
    resumo() {
        const e = RD.estado;
        const r = { atividades: 0, atividadesFeitas: 0, extras: 0, extrasFeitos: 0, segredos: 0, segredosAchados: 0, upgrades: Object.keys(RD.UPGRADES).length, upgradesPegos: e.upgrades.length };
        RD.CENARIOS.forEach((cen, i) => {
            Object.keys(cen.salas).forEach((s) => {
                const d = cen.salas[s];
                const k = this.chave(i, s);
                if (d.atividade) {
                    r.atividades++;
                    if (e.atividades[k]) r.atividadesFeitas++;
                    if (d.opcional) {
                        r.extras++;
                        if (e.atividades[k]) r.extrasFeitos++;
                    }
                }
                if (d.tipo === 'secreta') {
                    r.segredos++;
                    if (e.segredos[k]) r.segredosAchados++;
                }
            });
        });
        return r;
    },

    // Decide o final depois de vencer o chefe
    finalVitoria() {
        const r = this.resumo();
        const tudo = r.atividadesFeitas === r.atividades && r.segredosAchados === r.segredos;
        return tudo ? 'verdadeiro' : 'normal';
    },
};
