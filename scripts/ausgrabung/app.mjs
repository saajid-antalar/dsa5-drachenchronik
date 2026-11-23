// Fenster „Die Ausgrabung“ (ApplicationV2)
import { ID, getState, setState, partyProfiles, costOf, cellName, generateCells, resetRun, newState, COLS, startTest, restoreTest } from "./logic.mjs";
import { findDigScene, createDigScene, syncTiles, cellAt, cellCenter } from "./scene.mjs";
import { clientDig, request, resultHTML, deleteTestMessages } from "./main.mjs";

const TERRAIN_COLORS = { sand: "#c9a86a", lehm: "#a0703f", geroell: "#7d6a55", mauer: "#5b4a6e", hohl: "#8a3a22" };

let AppClass = null;
export class AusgrabungApp {
  constructor() {
    AppClass ??= buildClass();
    return new AppClass();
  }
}

function buildClass() {
  const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

  return class extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
      id: "dsa-ausgrabung-app",
      classes: ["dsa-ausgrabung"],
      window: { title: "Die Ausgrabung", icon: "fa-solid fa-trowel", resizable: true },
      position: { width: 940, height: 780 },
      actions: {
        tab: function (ev, t) { this.tab = t.dataset.tab; this.render(); },
        cell: function (ev, t) { this._onCell(Number(t.dataset.idx)); },
        pick: function () { this._pickOnCanvas(); },
        dig: function () { const s = this.scene; if (s && this.selected != null) { const i = this.selected; this.selected = null; clientDig(s, i); } },
        clear: function () { this.selected = null; this.render(); },
        buyWood: function () { request("buyWood", { sceneId: this.scene.id }); },
        paint: function (ev, t) { this.paint = t.dataset.mode; this.render(); },
        createScene: async function () { await createDigScene(); this.render(); },
        viewScene: function () { this.scene?.view(); },
        regen: function () { this._gmEdit(s => {
          const area = s.cells.map(c => c.area), keys = s.cells.map(c => c.key);
          s.settings.seed = Math.floor(Math.random() * 99999);
          s.cells = generateCells(s.settings.seed, s.terrain, area);
          s.cells.forEach((c, i) => c.key = keys[i]);
          resetRun(s);
        }); },
        reset: function () { this._gmEdit(s => resetRun(s)); },
        sync: async function () { await syncTiles(this.scene); ui.notifications.info("Kacheln der Grabung neu aufgebaut."); },
        newGame: function () { this._gmEdit(() => newState(), true); },
        testStart: function () { this._gmEdit(s => startTest(s)); },
        testReset: async function () { this.selected = null; await this._gmEdit(s => restoreTest(s, true), true); await deleteTestMessages(); ui.notifications.info("Test zurückgesetzt."); },
        testEnd: async function () { this.selected = null; await this._gmEdit(s => restoreTest(s, false), true); await deleteTestMessages(); ui.notifications.info("Testmodus beendet, Stand vor dem Test wiederhergestellt."); }
      }
    };

    static PARTS = {
      main: { template: `modules/${ID}/templates/ausgrabung/app.hbs`, scrollable: [".ausg-scroll"] }
    };

    tab = "spiel";
    selected = null;
    paint = "area";

    get scene() { return findDigScene(); }

    async _prepareContext() {
      const scene = this.scene;
      const isGM = game.user.isGM;
      if (!scene) return { noScene: true, isGM };
      const state = getState(scene);
      if (!state) return { noScene: true, isGM };
      const gmTab = isGM && this.tab === "leitung";
      const heroes = partyProfiles(state);
      const present = heroes.filter(h => h.present);
      const board = [];
      board.push({ lab: true, text: "" });
      COLS.forEach(c => board.push({ lab: true, text: c }));
      for (let r = 0; r < 10; r++) {
        board.push({ lab: true, text: String(r + 1) });
        for (let c = 0; c < 10; c++) {
          const i = r * 10 + c, cell = state.cells[i];
          const t = state.terrain.find(x => x.id === cell.terrain) ?? state.terrain[0];
          const o = { idx: i, name: cellName(i), cls: [], style: "", text: "", hint: "", ev: "" };
          if (!cell.area) o.cls.push("out");
          if (cell.dug) {
            o.cls.push("dug"); o.style = `background:${TERRAIN_COLORS[t.id] ?? "#999"}`;
            o.text = t.short ?? t.name; o.hint = cell.hint == null ? "" : String(cell.hint);
            o.ev = cell.event === "good" ? "◆" : cell.event === "bad" ? "✕" : "";
            if (cell.key) o.cls.push("key");
          } else if (gmTab && cell.area) {
            o.style = `background:${TERRAIN_COLORS[t.id] ?? "#999"}66`; o.text = t.short ?? t.name;
            if (cell.key) o.cls.push("gmkey");
          }
          if (i === this.selected) o.cls.push("sel");
          o.cls = o.cls.join(" ");
          o.disabled = !gmTab && (!cell.area || cell.dug);
          board.push(o);
        }
      }
      let sel = null;
      if (this.selected != null && !gmTab) {
        sel = { name: cellName(this.selected) };
        if (isGM) {
          const c = costOf(state, this.selected);
          sel.preview = `${c.t.name}: ${c.days} Tg., ${c.crew} Arbeiter, ${c.wage} S, ${c.wood} Balken${c.shortHanded ? " (zu wenig Arbeiter)" : ""}`;
        }
      }
      const ctx = {
        isGM, gmTab, tab: this.tab, sceneName: scene.name, onScene: canvas?.scene?.id === scene.id,
        res: [
          { k: "Silber", v: state.run.silver, neg: state.run.silver < 0 },
          { k: "Balken", v: state.run.wood, neg: state.run.wood < 0 },
          { k: "Tage übrig", v: state.run.days, neg: state.run.days < 0 },
          { k: "Arbeiter", v: state.settings.workers }
        ],
        woodPrice: state.settings.woodPrice,
        canBuyWood: state.run.silver >= state.settings.woodPrice,
        board, sel,
        leaderOptions: present.map(h => ({ id: h.id, name: h.name, selected: h.id === state.leader, note: h.luck > 0 ? "Glück" : h.luck < 0 ? "Pech" : "" })),
        hasLeader: present.some(h => h.id === state.leader),
        heroes,
        noHeroes: !heroes.length,
        last: state.last ? resultHTML(state, state.last) : "",
        finds: state.finds,
        log: state.log,
        bonusDay: state.run.bonusDay,
        testActive: !!state.test?.active,
        forceOptions: Array.from({ length: 21 }, (_, v) => ({ v, label: v ? String(v) : "zufällig (online würfeln)", selected: Number(state.test?.forceD20 ?? 0) === v }))
      };
      if (isGM) {
        ctx.settings = state.settings;
        ctx.terrain = state.terrain.map((t, i) => ({ ...t, i }));
        ctx.keys = state.keys.map(k => ({ ...k, name: cellName(k.idx) })).sort((a, b) => a.idx - b.idx);
        ctx.actors = game.actors.filter(a => a.type === "character").map(a => ({ id: a.id, name: a.name, inParty: state.party.includes(a.id) }));
        ctx.paint = ["area", "out", "key", "terrain"].map(m => ({ mode: m, active: this.paint === m,
          label: { area: "Grabungsbereich", out: "Gesperrt (Fels)", key: "Schlüsselfund ✦", terrain: "Gelände wechseln" }[m] }));
      }
      return ctx;
    }

    _onRender(context, options) {
      const el = this.element;
      el.querySelector("[data-leader]")?.addEventListener("change", ev => request("leader", { sceneId: this.scene.id, actorId: ev.target.value }));
      el.querySelectorAll("[data-present]").forEach(cb => cb.addEventListener("change", ev =>
        request("present", { sceneId: this.scene.id, actorId: cb.dataset.present, present: ev.target.checked })));
      if (!game.user.isGM) return;
      el.querySelectorAll("[data-setting]").forEach(inp => inp.addEventListener("change", () =>
        this._gmEdit(s => { s.settings[inp.dataset.setting] = Number(inp.value) || 0; })));
      el.querySelectorAll("[data-terrain]").forEach(inp => inp.addEventListener("change", () =>
        this._gmEdit(s => {
          const t = s.terrain[Number(inp.dataset.terrain)], f = inp.dataset.field;
          t[f] = f === "name" || f === "short" ? inp.value : (Number(inp.value) || 0);
        })));
      el.querySelectorAll("[data-key]").forEach(inp => inp.addEventListener("change", () =>
        this._gmEdit(s => { const k = s.keys.find(x => x.idx === Number(inp.dataset.key)); if (k) k.text = inp.value; })));
      el.querySelector("[data-test-force]")?.addEventListener("change", ev =>
        this._gmEdit(s => { if (s.test) s.test.forceD20 = Number(ev.target.value) || 0; }));
      el.querySelectorAll("[data-party]").forEach(cb => cb.addEventListener("change", () =>
        this._gmEdit(s => {
          s.party = s.party.filter(id => id !== cb.dataset.party);
          if (cb.checked) s.party.push(cb.dataset.party);
        })));
    }

    async _gmEdit(fn, replace = false) {
      const scene = this.scene;
      if (!game.user.isGM || !scene) return;
      let s = getState(scene);
      const r = fn(s);
      if (replace && r) s = r;
      await setState(scene, s);
      await syncTiles(scene, s);
    }

    _onCell(i) {
      const scene = this.scene; if (!scene) return;
      if (game.user.isGM && this.tab === "leitung") {
        return this._gmEdit(s => {
          const c = s.cells[i];
          if (c.dug) return;
          if (this.paint === "area") c.area = true;
          else if (this.paint === "out") { c.area = false; c.key = false; s.keys = s.keys.filter(k => k.idx !== i); }
          else if (this.paint === "key") {
            c.area = true; c.key = !c.key;
            s.keys = s.keys.filter(k => k.idx !== i);
            if (c.key) s.keys.push({ idx: i, text: "Schlüsselfund (Text eintragen)" });
          } else if (this.paint === "terrain") {
            const k = s.terrain.findIndex(t => t.id === c.terrain);
            c.terrain = s.terrain[(k + 1) % s.terrain.length].id;
          }
        });
      }
      this.selected = i;
      if (canvas?.scene?.id === scene.id && canvas.ping) canvas.ping(cellCenter(scene, i));
      this.render();
    }

    _pickOnCanvas() {
      const scene = this.scene;
      if (canvas?.scene?.id !== scene?.id) return ui.notifications.warn("Bitte zuerst die Grabungsszene ansehen.");
      ui.notifications.info("Klicke auf der Karte auf ein Feld im Grabungsbereich.");
      canvas.stage.once("pointerdown", ev => {
        const pt = ev.getLocalPosition ? ev.getLocalPosition(canvas.stage) : canvas.mousePosition;
        const i = cellAt(scene, pt);
        const st = getState(scene);
        if (i == null || !st.cells[i].area || st.cells[i].dug) return ui.notifications.warn("Dort kann nicht gegraben werden.");
        this.selected = i;
        this.render({ force: true });
      });
    }
  };
}
