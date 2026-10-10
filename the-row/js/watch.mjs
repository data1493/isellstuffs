import { CATALOG, tagMark } from "./room.mjs?v=6";

export function mineSide(room, you) {
  if (!you?.handle) return null;
  if (room?.seats?.left === you.handle) return "left";
  if (room?.seats?.right === you.handle) return "right";
  return null;
}

export function ensureTagStyle() {
  if (document.getElementById("row-tag-style")) return;
  const style = document.createElement("style");
  style.id = "row-tag-style";
  style.textContent = `
    .streak { font-style: normal; margin-left: 0.35rem; color: #d8ff3e; font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 0.72rem; letter-spacing: 0.08em; }
    .who .streak { font-size: 0.38em; vertical-align: 0.4em; }
    .crown { font-style: normal; margin-left: 0.28rem; color: #d8ff3e; }
    .chip .streak, .chip .crown, .you-stamp .streak, .you-stamp .crown { font-size: 0.85em; }
    .side.hot { background: rgba(216, 255, 62, 0.16); box-shadow: inset 0 0 90px rgba(216, 255, 62, 0.28); }
  `;
  document.head.appendChild(style);
}

export function fillTag(node, room, handle) {
  const mark = tagMark(room, handle);
  node.replaceChildren(document.createTextNode(handle));
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
    crown.setAttribute("aria-label", "crown");
    node.append(crown);
  }
}

export function paintWho(side, room) {
  const node = document.querySelector(`#${side} .who`);
  if (!node) return;
  const handle = room.seats?.[side] || (side === "left" ? "nova" : "jun");
  fillTag(node, room, handle);
}

export function flashSides(prev, next) {
  if (!prev || !next) return;
  const sides = [];
  if (next.pile.leftScore > prev.pile.leftScore || next.line.leftVotes > prev.line.leftVotes) sides.push("left");
  if (next.pile.rightScore > prev.pile.rightScore || next.line.rightVotes > prev.line.rightVotes) sides.push("right");
  if (prev.lane.leftTap == null && next.lane.leftTap != null) sides.push("left");
  if (prev.lane.rightTap == null && next.lane.rightTap != null) sides.push("right");
  for (const side of sides) {
    const node = document.querySelector(side === "left" ? "#left" : "#right");
    if (!node) continue;
    node.classList.remove("hot");
    void node.offsetWidth;
    node.classList.add("hot");
    window.setTimeout(() => node.classList.remove("hot"), 460);
  }
}

const bars = new Map();

export function playBar(id) {
  const item = CATALOG.find((drop) => drop.id === id);
  if (!item?.bar) return;
  let audio = bars.get(id);
  if (!audio) {
    audio = new Audio(item.bar);
    audio.preload = "auto";
    audio.hidden = true;
    document.body.append(audio);
    bars.set(id, audio);
  }
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

export function awardBar(before, after) {
  if (!before || !after || before.pile?.status === "won" || after.pile?.status !== "won" || !after.pile?.winner) return;
  const you = after.you?.handle;
  const winner = after.seats?.[after.pile.winner];
  if (!you || you !== winner) return;
  playBar(after.drop?.id);
}

let moveChain = Promise.resolve();

export function reportMove(body) {
  moveChain = moveChain.then(async () => {
    try {
      return await postRow("/round", body);
    } catch {
      return null;
    }
  });
  return moveChain;
}

export async function postRow(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.json();
}
