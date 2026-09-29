import test from "node:test";
import assert from "node:assert/strict";
import { revive } from "../js/room.mjs";
import { CROWD_SIZE, crowdBeat, fillRoom } from "../js/crowd.mjs";

function run(steps) {
  let state = fillRoom();
  let beat = 0;
  for (let i = 0; i < steps; i += 1) {
    const next = crowdBeat(state, beat);
    state = next.state;
    beat = next.beat;
  }
  return state;
}

test("a filled room is near the cap and has no visitor", () => {
  const room = fillRoom();
  assert.equal(room.people.length, CROWD_SIZE);
  assert.equal(room.you, null);
  assert.equal(new Set(room.people.map((person) => person.handle)).size, CROWD_SIZE);
  assert.ok(room.people.every((person) => person.link.startsWith("https://")));
});

test("pile reaches a winner, then the room keeps talking", () => {
  const won = run(23);
  assert.equal(won.pile.status, "won");
  assert.equal(won.pile.winner, "left");
  assert.equal(won.pile.leftScore, 5);
  assert.equal(won.drop.holder, "nova");
  const held = run(30);
  assert.equal(held.pile.status, "won");
  assert.equal(held.people.length, CROWD_SIZE);
  assert.notEqual(held.vibes[0].text, run(23).vibes[0].text);
});

test("best line and the lane each take a round", () => {
  const lines = run(41);
  assert.equal(lines.pile.game, "line");
  assert.ok(lines.line.leftText);
  assert.ok(lines.line.rightText);
  const laneOpen = run(81);
  assert.equal(laneOpen.pile.game, "lane");
  assert.equal(laneOpen.pile.status, "open");
  assert.equal(typeof laneOpen.lane.leftTap, "number");
  assert.equal(laneOpen.lane.rightTap, null);
  const laneCalled = run(95);
  assert.equal(laneCalled.pile.status, "won");
  assert.equal(laneCalled.pile.winner, "right");
});

test("the next loop switches the drop and stays a valid room", () => {
  const room = run(109);
  assert.equal(room.drop.id, "list");
  assert.equal(room.people.length, CROWD_SIZE);
  assert.equal(room.you, null);
  assert.ok(room.vibes.length <= 8);
  const revived = revive(JSON.parse(JSON.stringify(room)));
  assert.equal(revived.version, 2);
  assert.equal(revived.people.length, CROWD_SIZE);
  assert.equal(revived.drop.id, room.drop.id);
});

test("a quiet beat holds the wall and the score", () => {
  const room = run(3);
  const held = crowdBeat(room, 3);
  assert.equal(held.beat, 4);
  assert.equal(held.state.vibes[0].text, room.vibes[0].text);
  assert.equal(held.state.pile.leftScore, room.pile.leftScore);
  assert.equal(held.state.people[0].handle, room.people[0].handle);
});

test("a long run stays at 22 people", () => {
  let state = fillRoom();
  let beat = 0;
  for (let i = 0; i < 220; i += 1) {
    const next = crowdBeat(state, beat);
    state = next.state;
    beat = next.beat;
    assert.equal(state.people.length, CROWD_SIZE);
    assert.equal(state.you, null);
    assert.ok(state.vibes.length <= 8);
  }
});
