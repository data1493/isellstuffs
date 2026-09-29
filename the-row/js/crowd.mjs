import {
  CATALOG,
  armLane,
  enterLine,
  focusDrop,
  join,
  pileOn,
  resetPile,
  say,
  seedRoom,
  tapLane,
  voteLine,
} from "./room.mjs";

export const CROWD_SIZE = 22;
const SPAN = 36;

const CAST = [
  "nova", "kit", "04", "jun", "row", "ace", "flux", "vex", "loom", "byte",
  "nyx", "pico", "reed", "sola", "mink", "grim", "hex", "wren", "oz", "juno",
  "drift", "quay",
];

const VIBES = [
  "This room is mean in a good way.",
  "Need a drum bus that isn’t polite.",
  "Who’s closer, say it.",
  "Don’t lock it. Play it.",
  "Jun is late and still in it.",
  "That mark was rude.",
  "Drop’s still open if you’re fast.",
  "First to five and I’m watching.",
  "The font looks expensive from here.",
  "Leave the seat. Play the file.",
  "Wall’s moving. Keep it one line.",
  "I’m on Jun until the lane.",
  "Hold the drop. The round is short.",
  "Kit heard it first.",
  "Reset and run the lane.",
  "Drawer 04 is the quiet one.",
  "J190 hits different in here.",
  "Tap late and you donate it.",
  "Both lines are up. Pick.",
  "Right side is stacked.",
  "Left side heard the pocket.",
  "I’m just here for the prize.",
  "Say less. Vote.",
  "New face up front.",
  "Twenty-two in and it still reads.",
  "Winner keeps it. Room takes ten.",
  "Nova’s side is not blinking.",
  "One more and this round is called.",
];

const LEFT_LINES = [
  "Night bus, no polish.",
  "The font walks in first.",
  "One bar. That’s the whole drop.",
  "Closest tap takes the seat.",
  "Leave it open and watch.",
];

const RIGHT_LINES = [
  "Polite is how you lose it.",
  "Jun already kept one.",
  "Play it louder than the room.",
  "I was on the mark.",
  "Lock it before they do.",
];

function apply(state, result) {
  return result?.ok ? result.state : state;
}

function clearYou(state) {
  if (!state.you) return state;
  const next = structuredClone(state);
  next.you = null;
  return next;
}

function talk(state, beat) {
  const person = state.people[beat % state.people.length];
  let text = VIBES[beat % VIBES.length];
  if (state.vibes[0]?.text === text) text = VIBES[(beat + 1) % VIBES.length];
  return apply(state, say(state, { handle: person.handle, text }));
}

function rotate(state, beat) {
  const index = (state.people.length - 1 - (beat % 7) + state.people.length) % state.people.length;
  const person = state.people[index];
  const link = person.link || `https://${person.handle}.room`;
  return apply(state, join(state, { handle: person.handle, link }));
}

function advanceDrop(state) {
  const ids = CATALOG.map((item) => item.id);
  const index = ids.indexOf(state.drop.id);
  const id = ids[(index + 1) % ids.length];
  return apply(state, focusDrop(state, id));
}

function markFor(beat) {
  return 28 + (beat % 45);
}

function clampTap(spot) {
  return Math.min(100, Math.max(0, spot));
}

function play(state, game, phase, beat) {
  if (game === "pile") {
    const side = { 2: "left", 4: "right", 8: "left", 10: "right", 14: "left", 16: "right", 20: "left", 22: "left" }[phase];
    if (!side) return null;
    return apply(state, pileOn(state, side));
  }
  if (game === "line") {
    if (phase === 2) return apply(state, enterLine(state, "left", LEFT_LINES[beat % LEFT_LINES.length]));
    if (phase === 4) return apply(state, enterLine(state, "right", RIGHT_LINES[beat % RIGHT_LINES.length]));
    const side = { 8: "left", 10: "right", 14: "left", 16: "right", 20: "left", 24: "left", 28: "left" }[phase];
    if (!side) return null;
    return apply(state, voteLine(state, side));
  }
  const mark = state.lane.mark;
  if (phase === 8) return apply(state, tapLane(state, "left", clampTap(mark - 7)));
  if (phase === 22) return apply(state, tapLane(state, "right", clampTap(mark + 2)));
  return null;
}

export function fillRoom(state = seedRoom()) {
  let next = state;
  for (const handle of CAST) {
    next = apply(next, join(next, { handle, link: `https://${handle}.room` }));
  }
  return clearYou(next);
}

export function crowdBeat(state, beat) {
  const phase = beat % SPAN;
  const round = Math.floor(beat / SPAN);
  const game = ["pile", "line", "lane"][round % 3];
  let next = state;

  if (phase === 0) {
    if (next.pile.status !== "open") next = resetPile(next).state;
    if (game === "pile" && round > 0 && round % 3 === 0) next = advanceDrop(next);
    if (game === "lane") next = apply(next, armLane(next, markFor(beat)));
    next = rotate(next, beat);
    return { state: clearYou(next), beat: beat + 1 };
  }

  if (next.pile.status !== "open") {
    return { state: clearYou(idle(next, phase, beat)), beat: beat + 1 };
  }

  const played = play(next, game, phase, beat);
  next = played == null ? idle(next, phase, beat) : played;
  return { state: clearYou(next), beat: beat + 1 };
}

function idle(state, phase, beat) {
  if (phase % 6 === 0) return rotate(state, beat);
  if (phase % 4 === 1) return talk(state, beat);
  return state;
}
