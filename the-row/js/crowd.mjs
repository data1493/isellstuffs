import {
  CATALOG,
  armLane,
  crownOf,
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

export const PULL_AFTER_MS = 20000;

export const CROWD_SIZE = 22;
const SPAN = 36;

export const CAST = [
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

function scriptedBeat(state, beat) {
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

function isCast(handle) {
  return Boolean(handle) && CAST.includes(handle);
}

function humanSeated(state) {
  return [state.seats?.left, state.seats?.right].some((handle) => handle && !isCast(handle));
}

function waitingGuest(state) {
  return (state.queue || []).find((item) => item.handle !== state.seats?.left && item.handle !== state.seats?.right) || null;
}

function holdingForHuman(state) {
  if (state.pile.status !== "won" || !state.pile.winner) return false;
  const handle = state.seats?.[state.pile.winner];
  if (!handle || isCast(handle)) return false;
  const choice = state.rematch?.[handle];
  return choice !== "back" && choice !== "out";
}

function champSide(state) {
  const crown = crownOf(state);
  if (crown && state.seats?.left === crown) return "left";
  if (crown && state.seats?.right === crown) return "right";
  const left = state.streaks?.[state.seats?.left] || 0;
  const right = state.streaks?.[state.seats?.right] || 0;
  if (left === 0 && right === 0) return (state.pile.leftScore || 0) >= (state.pile.rightScore || 0) ? "left" : "right";
  return left >= right ? "left" : "right";
}

function forceFinish(state) {
  let next = state;
  const game = next.pile.game || "pile";
  let guard = 0;
  while (next.pile.status === "open" && guard < 8) {
    guard += 1;
    const side = champSide(next);
    if (game === "line") {
      if (!next.line.leftText) next = apply(next, enterLine(next, "left", LEFT_LINES[0]));
      if (!next.line.rightText) next = apply(next, enterLine(next, "right", RIGHT_LINES[0]));
      const voted = apply(next, voteLine(next, side));
      if (voted === next) break;
      next = voted;
      continue;
    }
    if (game === "lane") {
      const mark = next.lane.mark;
      if (next.lane.leftTap == null) next = apply(next, tapLane(next, "left", clampTap(mark - 7)));
      if (next.pile.status === "open" && next.lane.rightTap == null) next = apply(next, tapLane(next, "right", clampTap(mark + 2)));
      if (next.pile.status === "open") break;
      continue;
    }
    const piled = apply(next, pileOn(next, side));
    if (piled === next) break;
    next = piled;
  }
  return next;
}

function fillBotSeats(state) {
  const next = structuredClone(state);
  next.seats = { left: next.seats?.left || null, right: next.seats?.right || null };
  for (const side of ["left", "right"]) {
    if (next.seats[side]) continue;
    const handle = CAST.find((name) => name !== next.seats.left && name !== next.seats.right);
    if (handle) next.seats[side] = handle;
  }
  return next;
}

function startRound(state, game, call) {
  let next = resetPile(state).state;
  next.pile.game = game || "pile";
  next.rematch = {};
  next.call = call || null;
  if (next.pile.game === "lane") {
    const armed = armLane(next, 36);
    if (armed.ok) next = armed.state;
  }
  return next;
}

export function pullQueue(state, now = Date.now()) {
  const waiting = waitingGuest(state);
  if (!waiting) return state;
  let next = state;
  if (next.pile.status === "open") {
    if (now - (waiting.at || 0) < PULL_AFTER_MS) return state;
    next = forceFinish(next);
    if (next.pile.status === "open") return state;
  }
  next = structuredClone(next);
  const winSide = next.pile.winner === "left" || next.pile.winner === "right" ? next.pile.winner : champSide(next);
  const loseSide = winSide === "left" ? "right" : "left";
  if (next.rematch?.[next.seats?.[winSide]] === "out") next.seats[winSide] = null;
  next.seats[loseSide] = null;
  const seat = next.seats[loseSide] == null ? loseSide : next.seats.left == null ? "left" : "right";
  next.seats[seat] = waiting.handle;
  next.queue = (next.queue || []).filter((item) => item.handle !== waiting.handle);
  next = fillBotSeats(next);
  const game = waiting.game || "pile";
  next = startRound(next, game, { handle: waiting.handle, game, at: now });
  return next;
}

function boardIsFresh(state) {
  return state.pile.leftScore + state.pile.rightScore === 0
    && !state.line.leftText
    && !state.line.rightText
    && state.line.leftVotes + state.line.rightVotes === 0
    && state.lane.leftTap == null
    && state.lane.rightTap == null;
}

function botSide(state) {
  if (isCast(state.seats?.left) && !isCast(state.seats?.right)) return "left";
  if (isCast(state.seats?.right) && !isCast(state.seats?.left)) return "right";
  if (isCast(state.seats?.left)) return "left";
  if (isCast(state.seats?.right)) return "right";
  return null;
}

function guestPlay(state, beat) {
  const side = botSide(state);
  if (!side) return state;
  const game = state.pile.game || "pile";
  if (game === "pile") return apply(state, pileOn(state, side));
  if (game === "line") {
    const key = side === "left" ? "leftText" : "rightText";
    if (!state.line[key]) {
      const lines = side === "left" ? LEFT_LINES : RIGHT_LINES;
      return apply(state, enterLine(state, side, lines[beat % lines.length]));
    }
    if (state.line.leftText && state.line.rightText) return apply(state, voteLine(state, side));
    return state;
  }
  const tapKey = side === "left" ? "leftTap" : "rightTap";
  if (state.lane[tapKey] != null) return state;
  const mark = state.lane.mark;
  const spot = side === "left" ? mark - 6 : mark + 3;
  return apply(state, tapLane(state, side, clampTap(spot)));
}

function guestBeat(state, beat, now) {
  const guest = waitingGuest(state);
  if (holdingForHuman(state)) {
    if (guest && now - (guest.at || 0) >= PULL_AFTER_MS) return pullQueue(state, now);
    return idle(state, beat % SPAN, beat);
  }
  if (state.pile.status !== "open") {
    if (guest) return pullQueue(state, now);
    if (state.pile.status === "won") {
      const game = state.call?.game || state.pile.game || "pile";
      return startRound(fillBotSeats(state), game, null);
    }
    return idle(state, beat % SPAN, beat);
  }
  let next = state;
  if (next.call && now - next.call.at >= 4500) {
    next = structuredClone(next);
    next.call = null;
  }
  if (state.call && now - state.call.at < 4500 && boardIsFresh(state)) return next;
  if (beat % 3 !== 0) return next;
  return guestPlay(next, beat);
}

export function crowdBeat(state, beat, now = Date.now()) {
  if (humanSeated(state) && holdingForHuman(state)) {
    return { state: clearYou(guestBeat(state, beat, now)), beat: beat + 1 };
  }
  const guest = waitingGuest(state);
  if (guest) {
    const age = now - (guest.at || 0);
    if (state.pile.status !== "open" || age >= PULL_AFTER_MS) {
      const pulled = pullQueue(state, now);
      if (pulled !== state) return { state: clearYou(pulled), beat: beat + 1 };
    }
  }
  let next = state;
  if (!humanSeated(next) && (!next.seats?.left || !next.seats?.right)) next = fillBotSeats(next);
  if (humanSeated(next)) return { state: clearYou(guestBeat(next, beat, now)), beat: beat + 1 };
  return scriptedBeat(next, beat);
}

function idle(state, phase, beat) {
  if (phase % 6 === 0) return rotate(state, beat);
  if (phase % 4 === 1) return talk(state, beat);
  return state;
}
