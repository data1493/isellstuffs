import test from "node:test";
import assert from "node:assert/strict";
import { act, pileOn, seedRoom, tapLane, voteLine, enterLine } from "../js/room.mjs";

const AT = 1_700_000_123_456;

function winPile(state, side, at) {
  let next = state;
  for (let i = 0; i < 50 && next.pile.status === "open"; i += 1) {
    const result = pileOn(next, side, at);
    assert.equal(result.ok, true, result.error);
    next = result.state;
  }
  return next;
}

test("pile win stamps the streak with the injected clock", () => {
  const won = winPile(seedRoom(), "left", AT);
  assert.equal(won.pile.status, "won");
  assert.equal(won.streakAt[won.seats.left], AT);
});

test("line vote win stamps the streak with the injected clock", () => {
  let state = enterLine(seedRoom(), "left", "left line").state;
  state = enterLine(state, "right", "right line").state;
  for (let i = 0; i < 50 && state.pile.status === "open"; i += 1) state = voteLine(state, "right", AT + 1).state;
  assert.equal(state.pile.status, "won");
  assert.equal(state.streakAt[state.seats.right], AT + 1);
});

test("lane win stamps the streak with the injected clock", () => {
  let state = tapLane(seedRoom(), "left", 50, AT + 2).state;
  state = tapLane(state, "right", 0, AT + 2).state;
  assert.equal(state.pile.status, "won");
  assert.equal(state.streakAt[state.seats.left], AT + 2);
});

test("act passes its clock through to the streak", () => {
  let state = seedRoom();
  const handle = state.seats.left;
  for (let i = 0; i < 50 && state.pile.status === "open"; i += 1) {
    state = act(state, { handle, side: "left", kind: "pile" }, AT + 3).state;
  }
  assert.equal(state.streakAt[handle], AT + 3);
});
