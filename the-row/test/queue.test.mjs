import test from "node:test";
import assert from "node:assert/strict";
import {
  act,
  crownOf,
  enqueue,
  join,
  pileOn,
  resetPile,
  revive,
  runItBack,
  stepOut,
  tagMark,
} from "../js/room.mjs";
import { crowdBeat, fillRoom, PULL_AFTER_MS, pullQueue } from "../js/crowd.mjs";

function guestRoom(at = 1_000) {
  let state = fillRoom();
  state = join(state, { handle: "guest", link: "https://guest.room" }).state;
  state.you = null;
  state = enqueue(state, { handle: "guest", game: "pile", at }).state;
  return state;
}

test("a win tally follows the seat and a loss clears it", () => {
  let state = fillRoom();
  for (let i = 0; i < 5; i += 1) state = pileOn(state, "left").state;
  assert.equal(state.streaks.nova, 1);
  assert.equal(state.streaks.jun, undefined);
  assert.equal(state.drop.holder, "nova");
  assert.equal(tagMark(state, "nova").streak, 1);
  assert.equal(tagMark(state, "nova").crown, true);
  assert.equal(tagMark(state, "jun").streak, 0);
  state = resetPile(state).state;
  assert.equal(state.streaks.nova, 1);
  assert.equal(state.pile.status, "open");
  for (let i = 0; i < 5; i += 1) state = pileOn(state, "right").state;
  assert.equal(state.streaks.nova, undefined);
  assert.equal(state.streaks.jun, 1);
  assert.equal(crownOf(state), "jun");
});

test("the crown stays with whoever reached the number first", () => {
  const state = fillRoom();
  state.streaks = { nova: 4, ace: 4 };
  state.streakAt = { nova: 50, ace: 10 };
  assert.equal(crownOf(state), "ace");
  state.streaks.jun = 5;
  state.streakAt.jun = 80;
  assert.equal(crownOf(state), "jun");
});

test("the winner can run it back, and stepping out opens the seat", () => {
  let state = fillRoom();
  for (let i = 0; i < 5; i += 1) state = pileOn(state, "left").state;
  assert.equal(runItBack(state, "jun").ok, false);
  const back = runItBack(state, "nova");
  assert.equal(back.ok, true);
  assert.equal(back.state.rematch.nova, "back");
  assert.equal(back.state.seats.left, "nova");
  const out = stepOut(state, "nova");
  assert.equal(out.ok, true);
  assert.equal(out.state.seats.left, null);
  assert.equal(out.state.streaks.nova, 1);
});

test("only the seated handle can move that side", () => {
  const state = fillRoom();
  assert.equal(act(state, { handle: "kit", kind: "pile", side: "left" }).ok, false);
  const moved = act(state, { handle: "nova", kind: "pile", side: "left" });
  assert.equal(moved.ok, true);
  assert.equal(moved.state.pile.leftScore, 1);
});

test("an old save still revives with an empty line and the two seats", () => {
  const back = revive({
    version: 1,
    people: [{ handle: "nova", link: "" }],
    drop: { id: "bold", holder: null },
    pile: { leftScore: 2, rightScore: 0, status: "open", winner: null },
    vibes: [{ handle: "nova", text: "still here" }],
  });
  assert.equal(back.version, 2);
  assert.deepEqual(back.queue, []);
  assert.equal(back.seats.left, "nova");
  assert.equal(back.seats.right, "jun");
  assert.deepEqual(back.streaks, {});
  assert.equal(back.call, null);
});

test("a reserved seat is called after the line has waited, and sooner when the round is already over", () => {
  const waiting = guestRoom(5_000);
  const early = pullQueue(waiting, 5_000 + 4_000);
  assert.equal(early.call, null);
  assert.equal(early.seats.right, "jun");
  const called = pullQueue(waiting, 5_000 + PULL_AFTER_MS + 500);
  assert.equal(called.call.handle, "guest");
  assert.ok(called.call.at - 5_000 < 30_000);
  assert.ok(called.seats.left === "guest" || called.seats.right === "guest");
  assert.equal(called.pile.status, "open");
  assert.equal(called.queue.length, 0);
  const champ = called.streaks.nova || called.streaks.jun;
  assert.ok(champ > 0);

  let won = fillRoom();
  for (let i = 0; i < 5; i += 1) won = pileOn(won, "left").state;
  won = join(won, { handle: "guest", link: "https://guest.room" }).state;
  won.you = null;
  won = enqueue(won, { handle: "guest", game: "lane", at: 10_000 }).state;
  const soon = pullQueue(won, 11_000);
  assert.equal(soon.call.handle, "guest");
  assert.equal(soon.call.game, "lane");
  assert.equal(soon.seats.left, "nova");
  assert.equal(soon.seats.right, "guest");
  assert.equal(soon.streaks.nova, 1);
});

test("bots keep playing the other seat once a person is called in", () => {
  let won = fillRoom();
  for (let i = 0; i < 5; i += 1) won = pileOn(won, "left").state;
  won = join(won, { handle: "guest", link: "https://guest.room" }).state;
  won.you = null;
  won = enqueue(won, { handle: "guest", game: "pile", at: 1_000 }).state;
  let state = pullQueue(won, 2_000);
  assert.equal(state.seats.right, "guest");
  let beat = 0;
  const now = state.call.at + 10_000;
  for (let i = 0; i < 12; i += 1) {
    const next = crowdBeat(state, beat, now + i);
    state = next.state;
    beat = next.beat;
  }
  assert.equal(state.pile.rightScore, 0);
  assert.ok(state.pile.leftScore > 0);
  assert.equal(state.you, null);
});
