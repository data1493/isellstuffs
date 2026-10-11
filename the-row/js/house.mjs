import { CAST, LEFT_LINES, PULL_AFTER_MS, RIGHT_LINES, VIBES } from "./crowd.mjs";
import { enterLine, pileOn, resetPile, say, seedRoom, tapLane, voteLine } from "./room.mjs";

// House bots sit in the two versus seats so the room is never empty.
// Real players are handles outside the cast. The count follows the seats:
//   0 real players (empty or quiet) → 2 bots, left and right.
//   1 real player → 1 bot in the open seat.
//   2 or more real players (the room is full) → 0 bots.
// A bot never takes a seat a real player is waiting on, and steps out of
// one when that player is due. Bots post on the wall every HOUSE_TALK_EVERY
// beats (8 × 2.4s) and play every HOUSE_PLAY_EVERY beats. They can move the
// round, and they cannot keep a prize drop.

export const HOUSE = ["nova", "jun"];
export const HOUSE_TALK_EVERY = 8;
export const HOUSE_PLAY_EVERY = 3;

export function botCountFor(players) {
  const count = Number(players) || 0;
  if (count <= 0) return HOUSE.length;
  if (count === 1) return 1;
  return 0;
}

export function isHouseBot(handle) {
  return HOUSE.includes(handle);
}

export function realPlayers(state) {
  return (state?.people || []).filter((person) => person?.handle && !CAST.includes(person.handle));
}

export function isHouseRoom(state) {
  const people = state?.people || [];
  if (!people.length) return false;
  return people.every((person) => isHouseBot(person.handle) || !CAST.includes(person.handle));
}

export function houseRoom() {
  const room = seedRoom();
  room.you = null;
  room.people = HOUSE.map((handle) => ({ handle, link: `https://${handle}.room` }));
  room.seats = { left: HOUSE[0], right: HOUSE[1] };
  room.queue = [];
  room.vibes = [
    { handle: HOUSE[0], text: VIBES[0] },
    { handle: HOUSE[1], text: "Versus is up. Winner keeps the font." },
  ];
  room.streaks = {};
  room.streakAt = {};
  room.call = null;
  room.rematch = {};
  return room;
}

function apply(state, result) {
  return result?.ok ? result.state : state;
}

function humanSeated(state) {
  return [state.seats?.left, state.seats?.right].some((handle) => handle && !CAST.includes(handle));
}

function duePlayer(state, person, now) {
  const ticket = (state.queue || []).find((item) => item.handle === person.handle);
  if (!ticket) return true;
  if (state.seats?.left === person.handle || state.seats?.right === person.handle) return true;
  const age = now - (ticket.at || 0);
  if (age < 0) return false;
  const humans = [state.seats?.left, state.seats?.right].filter((handle) => handle && !CAST.includes(handle)).length;
  if (humans < 2) return true;
  return age >= PULL_AFTER_MS;
}

function sameHumans(left, right, players) {
  const names = (seats) => ["left", "right"]
    .map((side) => seats?.[side])
    .filter((handle) => players.includes(handle))
    .sort()
    .join();
  return names(left) === names(right);
}

export function staffHouse(state, now = Date.now()) {
  const next = structuredClone(state);
  const players = realPlayers(next);
  if (next.you?.handle && !CAST.includes(next.you.handle) && !players.some((person) => person.handle === next.you.handle)) {
    players.unshift({ handle: next.you.handle, link: next.you.link || "" });
  }
  const due = players.filter((person) => duePlayer(next, person, now));
  const wanted = botCountFor(players.length);
  const bots = HOUSE.slice(0, wanted).map((handle) => ({ handle, link: `https://${handle}.room` }));
  const winner = next.pile?.status === "won" ? next.seats?.[next.pile.winner] : "";
  const humanWon = Boolean(winner) && !isHouseBot(winner) && !CAST.includes(winner);
  next.people = [...players, ...bots];
  if (humanWon) {
    if (isHouseBot(next.drop?.holder)) next.drop = { ...next.drop, holder: null };
    return next;
  }
  const playerNames = due.map((person) => person.handle);
  const already = ["left", "right"].map((side) => next.seats?.[side]).filter((handle) => playerNames.includes(handle));
  const queued = (next.queue || []).map((item) => item.handle).filter((handle) => playerNames.includes(handle) && !already.includes(handle));
  const loose = playerNames.filter((handle) => !already.includes(handle) && !queued.includes(handle));
  const lineup = [...already, ...queued, ...loose, ...bots.map((bot) => bot.handle)].slice(0, 2);
  const seats = { left: lineup[0] || null, right: lineup[1] || null };
  const moved = !sameHumans(next.seats, seats, playerNames);
  next.seats = seats;
  next.queue = (next.queue || []).filter((item) => item.handle !== seats.left && item.handle !== seats.right);
  if (moved && next.pile?.status === "open") {
    const reset = resetPile(next);
    if (reset.ok) return reset.state;
  }
  if (isHouseBot(next.drop?.holder)) next.drop = { ...next.drop, holder: null };
  return next;
}

function talk(state, beat) {
  if (!beat || beat % HOUSE_TALK_EVERY !== 0) return state;
  const bots = (state.people || []).filter((person) => isHouseBot(person.handle));
  if (!bots.length) return state;
  const handle = bots[Math.floor(beat / HOUSE_TALK_EVERY) % bots.length].handle;
  let text = VIBES[beat % VIBES.length];
  if (state.vibes?.[0]?.text === text) text = VIBES[(beat + 1) % VIBES.length];
  return apply(state, say(state, { handle, text }));
}

function clampTap(spot) {
  return Math.min(100, Math.max(0, spot));
}

function botSides(state) {
  return ["left", "right"].filter((side) => isHouseBot(state.seats?.[side]));
}

function play(state, beat) {
  if (state.pile?.status !== "open") return state;
  if (beat % HOUSE_PLAY_EVERY !== 0) return state;
  const sides = botSides(state);
  if (!sides.length) return state;
  const side = sides.length === 1 ? sides[0] : sides[Math.floor(beat / HOUSE_PLAY_EVERY) % sides.length];
  const human = humanSeated(state);
  if (!state.pile.game && human) return state;
  const game = state.pile.game || "pile";
  if (game === "line") {
    const key = side === "left" ? "leftText" : "rightText";
    if (!state.line[key]) {
      const lines = side === "left" ? LEFT_LINES : RIGHT_LINES;
      return apply(state, enterLine(state, side, lines[beat % lines.length]));
    }
    if (!state.line.leftText || !state.line.rightText) return state;
    const votes = side === "left" ? state.line.leftVotes : state.line.rightVotes;
    if (votes + 1 >= state.pile.goal) return human ? state : resetPile(state).state;
    return apply(state, voteLine(state, side));
  }
  if (game === "lane") {
    const tapKey = side === "left" ? "leftTap" : "rightTap";
    if (state.lane[tapKey] != null) return state;
    const spot = clampTap(side === "left" ? state.lane.mark - 20 : state.lane.mark + 20);
    const tapped = apply(state, tapLane(state, side, spot));
    if (tapped.pile?.status === "won" && isHouseBot(tapped.seats?.[tapped.pile.winner])) return resetPile(state).state;
    return tapped;
  }
  const score = side === "left" ? state.pile.leftScore : state.pile.rightScore;
  if (score + 1 >= state.pile.goal) return human ? state : resetPile(state).state;
  return apply(state, pileOn(state, side));
}

export function stripBotPrize(state) {
  if (state?.pile?.status !== "won" || !state.pile.winner) return state;
  const winner = state.seats?.[state.pile.winner];
  if (!isHouseBot(winner)) return state;
  const reset = resetPile(state);
  return reset.ok ? reset.state : state;
}

export function houseBeat(state, beat, now = Date.now()) {
  let next = staffHouse(state, now);
  next = talk(next, beat);
  next = play(next, beat);
  next = stripBotPrize(next);
  return { state: next, beat: beat + 1 };
}
