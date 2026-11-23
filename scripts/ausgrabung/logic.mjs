// Spiellogik: Zustand, Heldenwerte aus den DSA5-Bögen, Kosten und Ereignisse.
// Gehört zum Modul dsa5-drachenchronik; Flags und Einstellungen laufen unter dessen ID.
export const ID = "dsa5-drachenchronik";
export const ASSETS = `modules/${ID}/assets/ausgrabung`;
export const COLS = "ABCDEFGHIJ".split("");

export const DEFAULT_LAYOUT = { x: 600, y: 400, cell: 200, n: 10 };

export const DEFAULT_TERRAIN = [
  { id: "sand",    name: "Flugsand",                  short: "Sand",   w: 30, days: 1, workers: 2, wood: 0, mod: 0 },
  { id: "lehm",    name: "Festgebackener Lehm",       short: "Lehm",   w: 20, days: 2, workers: 3, wood: 0, mod: 0 },
  { id: "geroell", name: "Geröll",                    short: "Geröll", w: 20, days: 2, workers: 4, wood: 1, mod: -1 },
  { id: "mauer",   name: "Mauerreste",                short: "Mauer",  w: 15, days: 3, workers: 3, wood: 2, mod: 2 },
  { id: "hohl",    name: "Hohlraum (Einsturzgefahr)", short: "Hohlraum", w: 15, days: 2, workers: 2, wood: 4, mod: -3 }
];

const DEFAULT_AREA = [
  "0001111000",
  "0011111100",
  "0111111110",
  "1111111110",
  "1111111111",
  "0111111111",
  "0111111110",
  "0011111100",
  "0001111000",
  "0000110000"];

export function cellName(i, n = 10) { return COLS[i % n] + (Math.floor(i / n) + 1); }
export function clone(o) { return foundry.utils.deepClone(o); }

function mulberry(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function generateCells(seed, terrain, area) {
  const rnd = mulberry(seed);
  const tot = terrain.reduce((a, t) => a + Number(t.w || 0), 0) || 1;
  const cells = [];
  for (let i = 0; i < 100; i++) {
    let r = rnd() * tot, tid = terrain[0].id;
    for (const t of terrain) { if (r < t.w) { tid = t.id; break; } r -= t.w; }
    const inArea = area ? area[i] : DEFAULT_AREA[Math.floor(i / 10)][i % 10] === "1";
    cells.push({ area: inArea, terrain: tid, key: false, dug: false, hint: null, event: null });
  }
  return cells;
}

export function defaultParty() {
  return game.actors.filter(a => a.type === "character" && a.hasPlayerOwner).map(a => a.id);
}

export function newState() {
  const seed = Math.floor(Math.random() * 99999);
  const terrain = clone(DEFAULT_TERRAIN);
  const s = {
    version: 1,
    settings: { start: 150, wood: 8, days: 20, wage: 1, woodPrice: 3, workers: 6, seed },
    terrain,
    cells: generateCells(seed, terrain),
    keys: [],
    party: defaultParty(),
    absent: [],
    leader: null,
    log: [], finds: [], last: null,
    run: {}
  };
  const areaIdx = s.cells.map((c, i) => c.area ? i : -1).filter(i => i >= 0);
  const rnd = mulberry(seed + 7);
  while (s.keys.length < 3) {
    const i = areaIdx[Math.floor(rnd() * areaIdx.length)];
    if (!s.cells[i].key) { s.cells[i].key = true; s.keys.push({ idx: i, text: `Schlüsselfund ${s.keys.length + 1} (Text aus dem Abenteuer eintragen)` }); }
  }
  resetRun(s);
  return s;
}

export function resetRun(s) {
  s.run = { silver: s.settings.start, wood: s.settings.wood, days: s.settings.days, bonusDay: 0 };
  s.log = []; s.finds = []; s.last = null;
  s.cells.forEach(c => { c.dug = false; c.hint = null; c.event = null; });
}

// ---------- Zustand lesen/schreiben (als JSON-Text, damit Flags nicht zusammengeführt werden) ----------
export function getState(scene) {
  const raw = scene?.getFlag(ID, "state");
  if (!raw) return null;
  try { return typeof raw === "string" ? JSON.parse(raw) : clone(raw); } catch (e) { console.error(ID, e); return null; }
}
export async function setState(scene, state) {
  await scene.update({ [`flags.${ID}.state`]: JSON.stringify(state) });
}
export function getLayout(scene) {
  return foundry.utils.mergeObject(clone(DEFAULT_LAYOUT), scene?.getFlag(ID, "layout") ?? {}, { inplace: false });
}

// ---------- Heldenwerte aus dem DSA5-Bogen ----------
function names(key) {
  return String(game.settings.get(ID, key) ?? "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
}
function stepOf(item) { return Number(item.system?.step?.value ?? 1) || 1; }
const ROMAN = ["", "I", "II", "III", "IV"];

export function heroProfile(actor) {
  const p = { id: actor.id, name: actor.name, img: actor.img, luck: 0, sense: false, magnet: false, leader: false, tags: [] };
  const glueck = names("ausgrabungNamesLuck"), pech = names("ausgrabungNamesBadLuck"), magnet = names("ausgrabungNamesMagnet");
  const anf = names("ausgrabungNamesLeader"), sense = names("ausgrabungNamesSense");
  const perLuck = Number(game.settings.get(ID, "ausgrabungLuckPerStep")) || 0;
  const perPech = Number(game.settings.get(ID, "ausgrabungBadLuckPerStep")) || 0;
  for (const it of actor.items) {
    const n = it.name.trim().toLowerCase();
    if (it.type === "advantage" && glueck.includes(n)) {
      const st = stepOf(it); p.luck += perLuck * st; p.tags.push({ text: `${it.name} ${ROMAN[st] ?? st}`, cls: "good" });
    } else if (it.type === "disadvantage" && pech.includes(n)) {
      const st = stepOf(it); p.luck -= perPech * st; p.tags.push({ text: `${it.name} ${ROMAN[st] ?? st}`, cls: "bad" });
    } else if (it.type === "disadvantage" && magnet.includes(n)) {
      p.magnet = true; p.tags.push({ text: it.name, cls: "bad" });
    } else if (it.type === "specialability" && anf.includes(n)) {
      p.leader = true; p.tags.push({ text: it.name, cls: "neu" });
    } else if (["advantage", "specialability"].includes(it.type) && sense.some(s => n.startsWith(s))) {
      if (!p.sense) p.sense = true;
      p.tags.push({ text: it.name, cls: "neu" });
    }
  }
  const fp = actor.system?.status?.fatePoints ?? {};
  p.schip = Number(fp.value ?? 0);
  p.schipMax = Number(fp.max ?? Math.max(p.schip, Number(fp.current ?? 0) + Number(fp.modifier ?? 0)));
  return p;
}

export function partyProfiles(state) {
  return (state.party ?? []).map(id => game.actors.get(id)).filter(Boolean).map(a => {
    const p = heroProfile(a);
    p.present = !(state.absent ?? []).includes(a.id);
    p.isLeader = state.leader === a.id;
    p.canEdit = a.isOwner;
    if (state.test?.active) p.schip = Math.max(0, p.schip - (state.test.schipUsed?.[a.id] ?? 0));
    return p;
  });
}

export function luckLabel(p) {
  if (!p || !p.luck) return "";
  return `${p.luck > 0 ? "+" : "−"}${Math.abs(p.luck)}`;
}

export function costOf(state, i) {
  const c = state.cells[i];
  const t = state.terrain.find(x => x.id === c.terrain) ?? state.terrain[0];
  let days = Math.max(1, Number(t.days) - (state.run.bonusDay || 0));
  const hired = Number(state.settings.workers) || 0;
  let shortHanded = false;
  if (t.workers > hired && hired > 0) { days = Math.ceil(days * t.workers / hired); shortHanded = true; }
  const crew = Math.min(t.workers, hired || t.workers);
  const wage = Math.round(days * crew * Number(state.settings.wage) * 10) / 10;
  return { t, days, wage, wood: Number(t.wood), crew, shortHanded };
}

function neighbors(i, n = 10) {
  const r = Math.floor(i / n), c = i % n, o = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (!dr && !dc) continue;
    const rr = r + dr, cc = c + dc;
    if (rr >= 0 && rr < n && cc >= 0 && cc < n) o.push(rr * n + cc);
  }
  return o;
}

function directionHint(state, idx) {
  const open = state.cells.map((c, i) => c.key && !c.dug && i !== idx ? i : -1).filter(i => i >= 0);
  if (!open.length) return "Alle Schlüsselfunde sind bereits gehoben.";
  const r = Math.floor(idx / 10), c = idx % 10;
  let best = open[0], bd = 1e9;
  for (const i of open) { const d = Math.abs(Math.floor(i / 10) - r) + Math.abs(i % 10 - c); if (d < bd) { bd = d; best = i; } }
  const br = Math.floor(best / 10), bc = best % 10;
  let dir = (br < r ? "Nord" : br > r ? "Süd" : "");
  dir += bc < c ? (dir ? "west" : "West") : bc > c ? (dir ? "ost" : "Ost") : "";
  return `Die Spuren weisen nach ${dir || "unten"}, etwa ${bd} Felder entfernt.`;
}

async function dice(formula) {
  const r = await new Roll(formula).evaluate();
  return r.total;
}

// Ereignistabelle nach Gesamtwurf (W20 + Modifikatoren)
const EVENTS = [
  { max: 2, kind: "bad", title: "Einsturz!", text: "Ein Abschnitt bricht ein. 2 Balken gehen verloren, ein Arbeiter ist verletzt (5 S für den Heiler).",
    victim: "1W6+2 SP durch herabstürzende Steine", victimRoll: "1d6+2",
    fx: async (s) => { s.run.wood = Math.max(0, s.run.wood - 2); s.run.silver -= 5; } },
  { max: 4, kind: "bad", title: "Skorpionnest", text: "Unter einer Steinplatte wimmelt es. Jemand wird gestochen.",
    victim: "Skorpiongift (Wirkung laut Regelwerk/Abenteuer)" },
  { max: 6, kind: "bad", title: "Sandsturm", text: "Der Wind treibt den Sand zurück in die Grube. Ein zusätzlicher Tag geht verloren.",
    fx: async (s) => { s.run.days -= 1; } },
  { max: 8, kind: "bad", title: "Murren der Arbeiter", text: "Hitze und Gerüchte über Flüche: Die Arbeiter wollen 25 % mehr Lohn für diesen Abschnitt.",
    leaderStops: true, fx: async (s, ctx) => { s.run.silver -= Math.ceil(ctx.wage * 0.25); } },
  { max: 12, kind: "neu", title: "Nur Sand und Scherben", text: "Ein paar gewöhnliche Tonscherben, sonst nichts." },
  { max: 14, kind: "good", title: "Alte Balken", text: "Eine verschüttete Stützkonstruktion liefert brauchbares Holz: +2 Balken.",
    fx: async (s) => { s.run.wood += 2; } },
  { max: 16, kind: "good", title: "Münzen im Schutt", text: "Alte Münzen kommen zum Vorschein.",
    fx: async (s, ctx, r) => { const v = await dice("2d6"); s.run.silver += v; r.extra = `Wert: ${v} Silbertaler (2W6).`; r.find = `Alte Münzen (${v} S)`; } },
  { max: 18, kind: "good", title: "Wertvoller Fund", text: "Ein gut erhaltenes Stück: Schmuck, ein Siegel oder eine beschriftete Tafel.",
    fx: async (s, ctx, r) => { const v = await dice("3d20"); r.extra = `Schätzwert ${v} Silbertaler (3W20). Die Spielleitung legt fest, was es ist.`; r.find = `Fundstück, Schätzwert ${v} S`; } },
  { max: 20, kind: "good", title: "Freigelegter Gang", text: "Die Arbeiter stoßen auf einen festen Zugang. Der nächste Abschnitt dauert 1 Tag weniger.",
    fx: async (s) => { s.run.bonusDay = 1; } },
  { max: 999, kind: "good", title: "Glücksfund", text: "Ein deutlicher Hinweis weist den Weg zum nächsten Schlüsselfund. Dazu etwas Wertvolles.",
    fx: async (s, ctx, r) => { const v = await dice("2d20"); s.run.silver += v; r.extra = `+${v} Silbertaler (2W20). ${directionHint(s, ctx.idx)}`; r.find = `Wertgegenstand (${v} S)`; } }
];

async function resolveEvent(state, last, profiles) {
  const ev = EVENTS.find(e => last.tot <= e.max);
  const r = { kind: ev.kind, title: ev.title, text: ev.text, extra: "", victim: "", find: null };
  const present = profiles.filter(p => p.present);
  const ctx = { wage: last.cost.wage, idx: last.idx };
  if (ev.leaderStops && present.some(p => p.leader)) {
    const a = present.find(p => p.leader);
    r.kind = "neu";
    r.extra = `${a.name} bringt die Arbeiter als Anführer zur Räson. Kein Mehrlohn.`;
  } else if (ev.fx) await ev.fx(state, ctx, r);
  if (ev.victim) {
    const mag = present.find(p => p.magnet);
    const v = mag ?? present[Math.floor(Math.random() * present.length)];
    let txt = ev.victim;
    if (ev.victimRoll) txt += `: ${await dice(ev.victimRoll)} SP`;
    r.victim = v ? `${v.name}${mag ? " (Pechmagnet)" : ""}: ${txt}` : txt;
  }
  if (r.find) state.finds.push({ cell: cellName(last.idx), text: r.find });
  return r;
}

// ---------- Aktionen der Spielleitung (laufen nur beim aktiven SL) ----------
export async function gmDig(scene, { idx, leaderId, d20: rolled, userId }) {
  const state = getState(scene);
  if (!state) return;
  const test = !!state.test?.active;
  const forced = test && Number(state.test.forceD20) > 0;
  let d20 = forced ? Number(state.test.forceD20) : Number(rolled);
  if (!(d20 >= 1)) d20 = (await new Roll("1d20").evaluate()).total;
  const cell = state.cells[idx];
  if (!cell || !cell.area || cell.dug) return;
  const profiles = partyProfiles(state);
  const lead = profiles.find(p => p.id === leaderId) ?? null;
  const cost = costOf(state, idx);
  const noWood = cost.wood > 0 && state.run.wood < cost.wood;
  state.run.silver = Math.round((state.run.silver - cost.wage) * 10) / 10;
  state.run.days -= cost.days;
  state.run.bonusDay = 0;
  if (!noWood) state.run.wood -= cost.wood;
  let key = null;
  if (cell.key) {
    key = state.keys.find(k => k.idx === idx)?.text ?? "Schlüsselfund";
    state.finds.push({ cell: cellName(idx), text: key, key: true });
  }
  const mods = [];
  if (lead?.luck) mods.push({ v: lead.luck, label: `${lead.name.split(" ")[0]}, ${lead.luck > 0 ? "Glück" : "Pech"}` });
  if (cost.t.mod) mods.push({ v: Number(cost.t.mod), label: cost.t.name });
  if (noWood) mods.push({ v: -4, label: "keine Abstützung" });
  const last = {
    id: foundry.utils.randomID(), idx, leaderId, d20, mods,
    tot: d20 + mods.reduce((a, m) => a + m.v, 0),
    cost: { days: cost.days, wage: cost.wage, wood: cost.wood, crew: cost.crew, shortHanded: cost.shortHanded, terrain: cost.t.name },
    noWood, key, rerolled: null, userId, test, forced,
    snap: { run: clone(state.run), finds: clone(state.finds) }
  };
  last.ev = await resolveEvent(state, last, profiles);
  const n = (await new Roll("1d6").evaluate()).total;
  const cnt = neighbors(idx).filter(k => state.cells[k].key && !state.cells[k].dug).length;
  cell.hint = (lead?.sense || n >= 4) ? cnt : "?";
  cell.dug = true; cell.event = last.ev.kind;
  state.last = last;
  pushLog(state, `${cellName(idx)} (${cost.t.name}) · ${last.ev.title}${key ? " · ✦ " + key : ""}`);
  await setState(scene, state);
  return { state, last, lead };
}

export async function gmReroll(scene, { digId, actorId, d20 }) {
  const state = getState(scene);
  const last = state?.last;
  if (!last || last.id !== digId || last.rerolled || last.ev.kind === "good") return;
  const actor = game.actors.get(actorId);
  if (!actor) return;
  const prof = partyProfiles(state).find(p => p.id === actorId);
  if (!prof || prof.schip < 1) return;
  if (state.test?.active) {
    // Testmodus: Schicksalspunkt nur vormerken, der Heldenbogen bleibt unverändert
    state.test.schipUsed[actorId] = (state.test.schipUsed[actorId] ?? 0) + 1;
  } else {
    const fp = Number(actor.system?.status?.fatePoints?.value ?? 0);
    await actor.update({ "system.status.fatePoints.value": fp - 1 });
  }
  state.run = clone(last.snap.run);
  state.finds = clone(last.snap.finds);
  last.d20 = d20;
  last.tot = d20 + last.mods.reduce((a, m) => a + m.v, 0);
  last.rerolled = actor.name;
  last.forced = false;
  last.ev = await resolveEvent(state, last, partyProfiles(state));
  state.cells[last.idx].event = last.ev.kind;
  pushLog(state, `Neuwurf (${actor.name}, Schicksalspunkt) · ${cellName(last.idx)} · ${last.ev.title}`);
  await setState(scene, state);
  return { state, last, lead: partyProfiles(state).find(p => p.id === last.leaderId) };
}

export function pushLog(state, text) {
  const day = Number(state.settings.days) - Number(state.run.days);
  state.log.unshift({ day, text });
  state.log = state.log.slice(0, 200);
}

// ---------- Testmodus ----------
function withoutTest(state) { const c = clone(state); delete c.test; return c; }

export function startTest(state) {
  state.test = { active: true, snapshot: withoutTest(state), schipUsed: {}, forceD20: 0 };
  pushLog(state, "Testmodus gestartet. Schicksalspunkte in den Bögen bleiben unangetastet.");
  return state;
}
/** Stand vor dem Test wiederherstellen; Testmodus bleibt an, wenn keepActive. */
export function restoreTest(state, keepActive) {
  if (!state.test?.snapshot) return state;
  const snap = clone(state.test.snapshot);
  if (keepActive) {
    snap.test = { active: true, snapshot: clone(state.test.snapshot), schipUsed: {}, forceD20: state.test.forceD20 ?? 0 };
    pushLog(snap, "Test zurückgesetzt.");
  }
  return snap;
}
