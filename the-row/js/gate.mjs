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
    .gate { position: fixed; inset: 0; z-index: 60; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.35rem; background: rgba(7, 8, 6, 0); color: #e7f0d4; text-align: center; font-family: "IBM Plex Mono", ui-monospace, monospace; transition: background-color 2.3s linear; }
    .gate.is-dim { background: rgba(7, 8, 6, 0.94); }
    .gate[hidden] { display: none; }
    .gate-kicker, .gate-where { margin: 0; letter-spacing: 0.22em; text-transform: uppercase; color: #d8ff3e; font-size: 0.75rem; }
    .gate-num { margin: 0; font-family: "Big Shoulders Display", Impact, sans-serif; font-weight: 800; font-size: clamp(7rem, 22vw, 14rem); line-height: 0.8; color: #d8ff3e; }
    .gate-num.is-word { font-size: clamp(2.4rem, 7vw, 4.2rem); letter-spacing: 0.16em; text-transform: uppercase; line-height: 1; }
    .gate-num.tick { animation: gate-pop 0.7s ease; }
    .gate-drop { margin: 0.3rem 0 0; font-family: "Big Shoulders Display", Impact, sans-serif; font-weight: 800; font-size: clamp(2rem, 5vw, 3.4rem); line-height: 0.9; text-transform: uppercase; }
    @keyframes gate-pop { from { transform: scale(0.82); } to { transform: scale(1); } }
    @media (prefers-reduced-motion: reduce) {
      .gate { transition: none; }
      .gate-num.tick { animation: none; }
    }
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
  node.classList.remove("is-dim");
  node.querySelector(".gate-kicker").textContent = kicker;
  node.querySelector(".gate-drop").textContent = drop;
  node.querySelector(".gate-where").textContent = where;
  const num = node.querySelector(".gate-num");
  num.classList.remove("is-word");
  void node.offsetWidth;
  node.classList.add("is-dim");
  const steps = ["3", "2", "1"];
  const beat = beats();
  return new Promise((resolve) => {
    let index = 0;
    const tick = () => {
      if (index >= steps.length) {
        num.textContent = "In";
        num.classList.add("is-word");
        num.classList.remove("tick");
        setTimeout(() => {
          running = false;
          resolve(true);
        }, Math.round(beat * 0.55));
        return;
      }
      num.classList.remove("is-word");
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

function tagBits(room, handle) {
  const streaks = room?.streaks || {};
  const streak = streaks[handle] || 0;
  let best = 0;
  let crown = null;
  let at = Infinity;
  const times = room?.streakAt || {};
  for (const person of [...(room?.people || [])].reverse()) {
    const n = streaks[person.handle] || 0;
    if (n <= 0) continue;
    const when = Number(times[person.handle] ?? Infinity);
    if (n > best || (n === best && when < at)) {
      best = n;
      crown = person.handle;
      at = when;
    }
  }
  return { streak: streak > 0 ? streak : 0, crown: crown === handle };
}

export function stampYou(you, room) {
  const node = document.querySelector("#youStamp");
  if (!node) return;
  node.hidden = !you;
  if (!you) return;
  node.replaceChildren(document.createTextNode(you.handle));
  if (!room) return;
  const mark = tagBits(room, you.handle);
  if (mark.streak) {
    const streak = document.createElement("i");
    streak.className = "streak";
    streak.textContent = String(mark.streak);
    node.append(streak);
  }
  if (mark.crown) {
    const crown = document.createElement("i");
    crown.className = "crown";
    crown.textContent = "♛";
    node.append(crown);
  }
}

function hideGate() {
  if (!root) return;
  root.classList.remove("is-dim");
  root.hidden = true;
}

export async function watchCall({ room, here, crowd, you }) {
  const call = room?.call;
  if (!you || !call || call.handle !== you.handle) return;
  if (leaving || running) return;
  if (document.visibilityState === "hidden") return;
  const token = `${call.handle}:${call.at}`;
  if (sessionStorage.getItem(KEY) === token) return;
  leaving = true;
  sessionStorage.setItem(KEY, token);
  await countIn({ kicker: "Your seat", drop: room.drop.name, where: NAMES[call.game] || "Pile" });
  leaving = false;
  if (here === call.game) {
    hideGate();
    document.dispatchEvent(new CustomEvent("row-in"));
    return;
  }
  location.assign(gameHref(call.game, crowd));
}
