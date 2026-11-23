// Szene im Khôm anlegen und die Felder als Kacheln (Tiles) darstellen.
import { ID, ASSETS, DEFAULT_LAYOUT, newState, getState, setState, getLayout } from "./logic.mjs";

const BG = `${ASSETS}/khom-grabung.webp`;
const TERRAIN_TEX = { sand: "sand", lehm: "lehm", geroell: "geroell", mauer: "mauer", hohl: "hohl" };

export function isDigScene(scene) { return !!scene?.getFlag(ID, "layout"); }

export function findDigScene() {
  if (isDigScene(canvas?.scene)) return canvas.scene;
  return game.scenes.find(s => isDigScene(s)) ?? null;
}

export async function createDigScene() {
  if (!game.user.isGM) return ui.notifications.warn("Nur die Spielleitung kann die Grabungsszene anlegen.");
  const state = newState();
  const data = {
    name: "Grabungsstätte im Khôm",
    width: 3200, height: 2800, padding: 0,
    background: { src: BG },
    backgroundColor: "#7a5a34",
    grid: { type: 1, size: DEFAULT_LAYOUT.cell, distance: 2, units: "Schritt", color: "#3a2412", alpha: 0.45, thickness: 2 },
    initial: { x: 1600, y: 1400, scale: 0.35 },
    tokenVision: false,
    fog: { exploration: false },
    flags: { [ID]: { layout: DEFAULT_LAYOUT, state: JSON.stringify(state) } }
  };
  // wie die Oase Bischa im Szenenordner „Drachenchronik“ ablegen
  let folder = game.folders.find(f => f.type === "Scene" && f.name === "Drachenchronik");
  if (!folder) folder = await Folder.create({ name: "Drachenchronik", type: "Scene", sorting: "a" });
  data.folder = folder.id;
  const scene = await Scene.create(data);
  // Ab V14 liegt der Hintergrund auf einer Ebene (Level). Falls die Übernahme nicht automatisch erfolgt ist, nachtragen.
  try {
    const lvl = scene.levels?.contents?.[0] ?? scene.firstLevel;
    if (lvl && !lvl.background?.src) await lvl.update({ "background.src": BG });
  } catch (e) { console.warn(`${ID} | Ebene konnte nicht angepasst werden`, e); }
  await syncTiles(scene, state);
  ui.notifications.info("Grabungsszene im Khôm angelegt.");
  return scene;
}

function tileData(key, src, x, y, w, h, sort) {
  return {
    texture: { src }, x, y, width: w, height: h, sort, elevation: 0,
    locked: true, hidden: false, alpha: 1,
    flags: { [ID]: { k: key } }
  };
}

/** Bringt die Kacheln der Szene auf den Stand des Spielzustands. */
export async function syncTiles(scene, state = getState(scene)) {
  if (!game.user.isGM || !scene || !state) return;
  const L = getLayout(scene);
  const want = new Map();
  state.cells.forEach((c, i) => {
    const x = L.x + (i % L.n) * L.cell, y = L.y + Math.floor(i / L.n) * L.cell, s = L.cell;
    if (!c.area && !c.dug) {
      const k = `fels:${i}`;
      want.set(k, tileData(k, `${ASSETS}/tiles/fels${i % 3}.webp`, x, y, s, s, 1));
      return;
    }
    if (!c.dug) return;
    const tex = TERRAIN_TEX[c.terrain] ?? "sand";
    let k = `grube:${i}:${tex}`;
    want.set(k, tileData(k, `${ASSETS}/tiles/${tex}.webp`, x, y, s, s, 2));
    if (c.key) { k = `fund:${i}`; want.set(k, tileData(k, `${ASSETS}/tiles/schluessel.webp`, x, y, s, s, 3)); }
    if (c.hint !== null && c.hint !== undefined) {
      const h = c.hint === "?" ? "x" : Math.min(8, Number(c.hint));
      const b = Math.round(s * 0.34);
      k = `spur:${i}:${h}`; want.set(k, tileData(k, `${ASSETS}/tiles/spur-${h}.webp`, x + s - b - 4, y + 4, b, b, 4));
    }
    if (c.event === "good" || c.event === "bad") {
      const b = Math.round(s * 0.28);
      const src = `${ASSETS}/tiles/ereignis-${c.event === "good" ? "gut" : "schlecht"}.webp`;
      k = `ereignis:${i}:${c.event}`; want.set(k, tileData(k, src, x + 4, y + s - b - 4, b, b, 4));
    }
  });
  const existing = scene.tiles.filter(t => t.getFlag(ID, "k"));
  const have = new Set(existing.map(t => t.getFlag(ID, "k")));
  const del = existing.filter(t => !want.has(t.getFlag(ID, "k"))).map(t => t.id);
  const add = [...want.entries()].filter(([k]) => !have.has(k)).map(([, d]) => d);
  if (del.length) await scene.deleteEmbeddedDocuments("Tile", del);
  if (add.length) await scene.createEmbeddedDocuments("Tile", add);
}

export async function rebuildScene(scene) {
  const state = getState(scene);
  if (!state) { await setState(scene, newState()); }
  await syncTiles(scene);
}

/** Weltkoordinate → Feldindex oder null */
export function cellAt(scene, point) {
  const L = getLayout(scene);
  const c = Math.floor((point.x - L.x) / L.cell), r = Math.floor((point.y - L.y) / L.cell);
  if (c < 0 || r < 0 || c >= L.n || r >= L.n) return null;
  return r * L.n + c;
}

export function cellCenter(scene, i) {
  const L = getLayout(scene);
  return { x: L.x + (i % L.n) * L.cell + L.cell / 2, y: L.y + Math.floor(i / L.n) * L.cell + L.cell / 2 };
}
