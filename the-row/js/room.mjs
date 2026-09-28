export const VERSION = 1;
export const GOAL = 5;
export const VIBE_CAP = 8;
export const WALL_SHOW = 4;

export const CATALOG = [
  {
    id: "j190",
    kicker: "FILE",
    name: "J190.WAV",
    detail: "One bar. Night.",
    price: "0.0042",
    keep: "0.0038",
    blurb: "One bar. Night. It sits here until someone locks it.",
  },
  {
    id: "bold",
    kicker: "FONT",
    name: "Bold Condensed",
    detail: "Twelve cuts of a display face",
    price: "17",
    keep: "15.3",
    blurb: "A loud display face. Twelve cuts. Also the prize in versus.",
  },
  {
    id: "list",
    kicker: "LIST",
    name: "Drawer 04",
    detail: "A list with prices on it",
    price: "19.3",
    keep: "17.37",
    blurb: "Titles and prices. Nothing extra. Lock the page.",
  },
  {
    id: "stub",
    kicker: "SEAT",
    name: "Versus seat",
    detail: "In on tonight’s run",
    price: "Open",
    keep: "—",
    blurb: "A seat in versus. Winner keeps the font.",
  },
];

export const SIDES = {
  left: { id: "nova", name: "Nova", crew: ["nova", "kit", "row", "ace", "flux"] },
  right: { id: "jun", name: "Jun", crew: ["jun", "04", "vex", "loom", "byte"] },
};

function dropFrom(id) {
  const found = CATALOG.find((item) => item.id === id) ?? CATALOG[1];
  return { ...found, holder: null };
}

function openPile() {
  return { goal: GOAL, leftScore: 0, rightScore: 0, status: "open", winner: null };
}

export function seedRoom() {
  return {
    version: VERSION,
    you: null,
    people: [
      { handle: "nova", link: "" },
      { handle: "kit", link: "" },
      { handle: "04", link: "" },
      { handle: "jun", link: "" },
      { handle: "row", link: "" },
    ],
    drop: dropFrom("bold"),
    pile: openPile(),
    vibes: [
      { handle: "nova", text: "This room is mean in a good way." },
      { handle: "kit", text: "Need a drum bus that isn’t polite." },
      { handle: "04", text: "Locked the sample. It’s stupid good." },
      { handle: "jun", text: "Versus is up. Winner keeps the font." },
    ],
  };
}

export function cleanHandle(raw) {
  return String(raw ?? "").trim().replace(/\s+/g, " ").slice(0, 16);
}

export function handleKey(raw) {
  return cleanHandle(raw).toLowerCase();
}

function clone(state) {
  return structuredClone(state);
}

function ok(state) {
  return { ok: true, state };
}

function fail(state, error) {
  return { ok: false, state, error };
}

function inRoom(state, key) {
  return state.people.some((person) => person.handle === key);
}

export function join(state, input) {
  const handle = handleKey(input?.handle);
  const link = String(input?.link ?? "").trim().slice(0, 64);
  if (!handle) return fail(state, "Need a handle.");
  if (!link) return fail(state, "Need a link.");
  const next = clone(state);
  next.people = next.people.filter((person) => person.handle !== handle);
  next.people.unshift({ handle, link });
  next.you = { handle, link };
  return ok(next);
}

export function say(state, input) {
  const handle = handleKey(input?.handle);
  const text = String(input?.text ?? "").trim().replace(/\s+/g, " ");
  if (!handle || !inRoom(state, handle)) return fail(state, "Get in first.");
  if (!text) return fail(state, "Say something.");
  if (text.length > 80) return fail(state, "Keep it to one line.");
  const next = clone(state);
  next.vibes = [{ handle, text }, ...next.vibes].slice(0, VIBE_CAP);
  return ok(next);
}

export function focusDrop(state, id) {
  if (state.pile.status !== "open") return fail(state, "This round is already called.");
  const item = CATALOG.find((entry) => entry.id === id);
  if (!item) return fail(state, "That drop isn’t on the floor.");
  if (state.drop.id === id) return ok(state);
  const next = clone(state);
  next.drop = { ...item, holder: null };
  next.pile = openPile();
  return ok(next);
}

export function lockDrop(state, handle) {
  const key = handleKey(handle);
  if (!key || !inRoom(state, key)) return fail(state, "Get in first.");
  if (state.pile.status !== "open") return fail(state, "This round is already called.");
  if (state.pile.leftScore + state.pile.rightScore > 0) return fail(state, "Versus already started.");
  const next = clone(state);
  next.drop = { ...next.drop, holder: key };
  next.pile = { ...next.pile, status: "locked", winner: null };
  return ok(next);
}

export function pileOn(state, side) {
  if (side !== "left" && side !== "right") return fail(state, "Pick a side.");
  if (state.pile.status !== "open") return fail(state, "This round is already called.");
  const next = clone(state);
  const scoreKey = side === "left" ? "leftScore" : "rightScore";
  next.pile[scoreKey] += 1;
  if (next.pile[scoreKey] >= next.pile.goal) {
    next.pile[scoreKey] = next.pile.goal;
    next.pile.status = "won";
    next.pile.winner = side;
    next.drop = { ...next.drop, holder: SIDES[side].id };
  }
  return ok(next);
}

export function resetPile(state) {
  const next = clone(state);
  next.pile = openPile();
  next.drop = { ...next.drop, holder: null };
  return ok(next);
}

export function pileLine(state) {
  const { pile, drop } = state;
  if (pile.status === "won") return `${SIDES[pile.winner].name} keeps ${drop.name}.`;
  if (pile.status === "locked") return `${drop.holder} locked ${drop.name}.`;
  return `${drop.name} is up.`;
}

export function wall(state) {
  return state.vibes.slice(0, WALL_SHOW);
}

export function revive(raw) {
  if (!raw || raw.version !== VERSION || !Array.isArray(raw.people) || !raw.pile || !raw.drop) return seedRoom();
  const drop = CATALOG.find((item) => item.id === raw.drop.id);
  if (!drop) return seedRoom();
  const goal = GOAL;
  const leftScore = clamp(raw.pile.leftScore, 0, goal);
  const rightScore = clamp(raw.pile.rightScore, 0, goal);
  let status = raw.pile.status;
  if (status !== "open" && status !== "won" && status !== "locked") status = "open";
  let winner = raw.pile.winner === "left" || raw.pile.winner === "right" ? raw.pile.winner : null;
  if (status === "won" && !winner) status = "open";
  if (status !== "won") winner = null;
  const people = raw.people
    .map((person) => ({ handle: handleKey(person?.handle), link: String(person?.link ?? "").slice(0, 64) }))
    .filter((person) => person.handle)
    .slice(0, 40);
  if (people.length === 0) return seedRoom();
  const vibes = Array.isArray(raw.vibes)
    ? raw.vibes
        .map((vibe) => ({ handle: handleKey(vibe?.handle), text: String(vibe?.text ?? "").trim().slice(0, 80) }))
        .filter((vibe) => vibe.handle && vibe.text)
        .slice(0, VIBE_CAP)
    : [];
  let you = null;
  if (raw.you?.handle) {
    const handle = handleKey(raw.you.handle);
    const found = people.find((person) => person.handle === handle);
    if (found) you = { handle, link: found.link };
  }
  let holder = raw.drop.holder ? handleKey(raw.drop.holder) : null;
  if (status === "open") holder = null;
  if (status === "won") holder = SIDES[winner].id;
  return {
    version: VERSION,
    you,
    people,
    drop: { ...drop, holder },
    pile: { goal, leftScore, rightScore, status, winner },
    vibes: vibes.length ? vibes : seedRoom().vibes,
  };
}

function clamp(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, Math.trunc(number)));
}
