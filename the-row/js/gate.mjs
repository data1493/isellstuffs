const NAMES = { pile: "Pile", line: "Best line", lane: "The lane" };
const PAGES = { pile: "/pile.html", line: "/line.html", lane: "/lane.html" };
const KEY = "the-row-gate";

let root;
let running = false;
let leaving = false;

export function matchToken(room) {
  const game = room?.pile?.game || "open";
  const drop = room?.drop?.id || "bold";
  const status = room?.pile?.status || "open";
  return `${game}:${drop}:${status}`;
}

export function gameHref(game, crowd) {
  const path = PAGES[game] || PAGES.pile;
  return crowd ? `${path}?crowd=1` : path;
}

function beats() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reduce ? 240 : 740;
}

function ensure() {
  if (root) return root;
  const style = document.createElement("style");
  style.textContent = `
    .gate { position: fixed; inset: 0; z-index: 60; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.35rem; background: #070806; color: #e7f0d4; text-align: center; font-family: "IBM Plex Mono", ui-monospace, monospace; }
    .gate[hidden] { display: none; }
    .gate-kicker, .gate-where { margin: 0; letter-spacing: 0.22em; text-transform: uppercase; color: #d8ff3e; font-size: 0.75rem; }
    .gate-num { margin: 0; font-family: "Big Shoulders Display", Impact, sans-serif; font-weight: 800; font-size: clamp(7rem, 22vw, 14rem); line-height: 0.8; color: #d8ff3e; }
    .gate-num.tick { animation: gate-pop 0.7s ease; }
    .gate-drop { margin: 0.3rem 0 0; font-family: "Big Shoulders Display", Impact, sans-serif; font-weight: 800; font-size: clamp(2rem, 5vw, 3.4rem); line-height: 0.9; text-transform: uppercase; }
    @keyframes gate-pop { from { transform: scale(0.82); } to { transform: scale(1); } }
    @media (prefers-reduced-motion: reduce) { .gate-num.tick { animation: none; } }
  `;
  document.head.appendChild(style);
  root = document.createElement("div");
  root.className = "gate";
  root.hidden = true;
  root.innerHTML = `<p class="gate-kicker"></p><p class="gate-num" aria-live="polite"></p><p class="gate-drop"></p><p class="gate-where"></p>`;
  document.body.appendChild(root);
  return root;
}

export function countIn({ kicker, drop, where }) {
  if (running) return Promise.resolve(false);
  running = true;
  const node = ensure();
  node.hidden = false;
  node.querySelector(".gate-kicker").textContent = kicker;
  node.querySelector(".gate-drop").textContent = drop;
  node.querySelector(".gate-where").textContent = where;
  const num = node.querySelector(".gate-num");
  const steps = ["3", "2", "1"];
  const beat = beats();
  return new Promise((resolve) => {
    let index = 0;
    const tick = () => {
      if (index >= steps.length) {
        num.textContent = "In";
        setTimeout(() => resolve(true), Math.round(beat * 0.55));
        return;
      }
      num.textContent = steps[index];
      num.classList.remove("tick");
      void num.offsetWidth;
      num.classList.add("tick");
      index += 1;
      setTimeout(tick, beat);
    };
    tick();
  });
}

export function stampYou(you) {
  const node = document.querySelector("#youStamp");
  if (!node) return;
  node.hidden = !you;
  node.textContent = you ? you.handle : "";
}

export async function enterMatch({ room, game, crowd }) {
  if (running || leaving) return;
  leaving = true;
  const named = game || room.pile.game || "pile";
  sessionStorage.setItem(KEY, `${named}:${room.drop.id}:${room.pile.status}`);
  await countIn({ kicker: "You're in", drop: room.drop.name, where: NAMES[named] || "Pile" });
  location.assign(gameHref(named, crowd));
}

export async function followMatch({ room, here, crowd, you }) {
  if (!you || leaving || running) return;
  if (document.visibilityState === "hidden") return;
  const game = room.pile.game;
  if (!game || room.pile.status !== "open") {
    if (here) sessionStorage.setItem(KEY, matchToken(room));
    return;
  }
  if (here === game) {
    sessionStorage.setItem(KEY, matchToken(room));
    return;
  }
  if (sessionStorage.getItem(KEY) === matchToken(room)) return;
  leaving = true;
  sessionStorage.setItem(KEY, matchToken(room));
  await countIn({ kicker: "You're in", drop: room.drop.name, where: NAMES[game] });
  location.assign(gameHref(game, crowd));
}
