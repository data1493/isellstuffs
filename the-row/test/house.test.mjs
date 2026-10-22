import test from "node:test";
import assert from "node:assert/strict";
import { enqueue, join, PEOPLE_CAP, pileOn, QUEUE_CAP, stepOut } from "../js/room.mjs";
import { crowdBeat, fillRoom } from "../js/crowd.mjs";
import {
  HOUSE,
  HOUSE_TALK_EVERY,
  botCountFor,
  houseBeat,
  houseRoom,
  isHouseBot,
  realPlayers,
  staffHouse,
  stripBotPrize,
} from "../js/house.mjs";

const now = 50_000;

function run(steps, state = houseRoom(), beat = 0, at = now) {
  const seen = [];
  for (let i = 0; i < steps; i += 1) {
    const next = houseBeat(state, beat, at);
    state = next.state;
    beat = next.beat;
    seen.push(state);
  }
  return { state, beat, seen };
}

function botsIn(state) {
  return (state.people || []).filter((person) => isHouseBot(person.handle)).map((person) => person.handle);
}

test("bot count follows the two seats", () => {
  assert.equal(botCountFor(0), 2);
  assert.equal(botCountFor(1), 1);
  assert.equal(botCountFor(2), 0);
  assert.equal(botCountFor(6), 0);
  assert.deepEqual(HOUSE, ["nova", "jun"]);
});

test("an empty room starts with two bots and no prize", () => {
  const room = houseRoom();
  assert.deepEqual(botsIn(room), ["nova", "jun"]);
  assert.equal(room.seats.left, "nova");
  assert.equal(room.seats.right, "jun");
  assert.equal(realPlayers(room).length, 0);
  assert.equal(room.drop.holder, null);
  assert.equal(room.pile.status, "open");
});

test("wall posts land on the talk beat and not between them", () => {
  const start = houseRoom().vibes[0].text;
  const quiet = run(HOUSE_TALK_EVERY);
  assert.equal(quiet.state.vibes[0].text, start);
  const talked = houseBeat(quiet.state, quiet.beat, now);
  assert.notEqual(talked.state.vibes[0].text, start);
  assert.equal(isHouseBot(talked.state.vibes[0].handle), true);
  let posts = 0;
  let previous = start;
  const played = run(HOUSE_TALK_EVERY * 4 + 1);
  for (const frame of played.seen) {
    if (frame.vibes[0].text !== previous) {
      posts += 1;
      previous = frame.vibes[0].text;
      assert.equal(isHouseBot(frame.vibes[0].handle), true);
    }
  }
  assert.equal(posts, 4);
});

test("two bots play the empty room and never keep the drop", () => {
  const played = run(48);
  assert.notEqual(played.state.pile.status, "won");
  assert.equal(played.state.drop.holder, null);
  assert.equal(botsIn(played.state).length, 2);
  const moved = played.seen.some((frame) => frame.pile.leftScore + frame.pile.rightScore > 0);
  assert.equal(moved, true);
  for (const frame of played.seen) {
    assert.notEqual(frame.pile.status, "won");
    assert.equal(frame.drop.holder, null);
  }
});

test("one player gets one bot, and the bot cannot take the prize", () => {
  let state = houseRoom();
  state.people = [{ handle: "mint", link: "https://mint.room" }, ...state.people];
  state.queue = [{ handle: "mint", link: "https://mint.room", game: "pile", at: now - 10 }];
  const seated = houseBeat(state, 0, now);
  state = seated.state;
  assert.deepEqual(botsIn(state), ["nova"]);
  assert.equal(state.seats.left, "mint");
  assert.equal(state.seats.right, "nova");
  assert.equal(state.queue.length, 0);
  state = pileOn(state, "left").state;
  const played = run(36, state, seated.beat, now);
  assert.notEqual(played.state.pile.status, "won");
  assert.equal(played.state.drop.holder, null);
  assert.ok(played.seen.some((frame) => frame.pile.rightScore > 0));
  assert.ok(played.seen.every((frame) => frame.pile.rightScore < 5));
  let won = played.state;
  const side = won.seats.left === "mint" ? "left" : "right";
  for (let i = 0; i < 5; i += 1) won = pileOn(won, side).state;
  assert.equal(won.pile.status, "won");
  assert.equal(won.drop.holder, "mint");
  const held = run(6, won, 0, now);
  assert.equal(held.state.drop.holder, "mint");
  assert.equal(isHouseBot(held.state.drop.holder), false);
});

test("a second player takes the last seat and both bots step out", () => {
  let state = staffHouse({
    ...houseRoom(),
    people: [
      { handle: "mint", link: "https://mint.room" },
      { handle: "salt", link: "https://salt.room" },
      { handle: "nova", link: "https://nova.room" },
      { handle: "jun", link: "https://jun.room" },
    ],
    queue: [
      { handle: "mint", link: "https://mint.room", game: "pile", at: now - 10 },
      { handle: "salt", link: "https://salt.room", game: "pile", at: now - 10 },
    ],
  }, now);
  assert.deepEqual(botsIn(state), []);
  assert.deepEqual([state.seats.left, state.seats.right].sort(), ["mint", "salt"]);
  assert.equal(state.queue.length, 0);
  const later = run(12, state, 0, now);
  assert.deepEqual(botsIn(later.state), []);
  assert.equal(later.state.drop.holder, null);
});

test("a bot does not sit while a real player is waiting on that seat", () => {
  const state = staffHouse({
    ...houseRoom(),
    people: [
      { handle: "mint", link: "https://mint.room" },
      { handle: "salt", link: "https://salt.room" },
    ],
    seats: { left: "nova", right: "jun" },
    queue: [
      { handle: "mint", link: "https://mint.room", game: "pile", at: now - 10 },
      { handle: "salt", link: "https://salt.room", game: "pile", at: now - 10 },
    ],
  }, now);
  assert.equal(isHouseBot(state.seats.left), false);
  assert.equal(isHouseBot(state.seats.right), false);
  assert.equal(botsIn(state).length, 0);
});

test("a bot win does not keep the drop", () => {
  const room = houseRoom();
  room.pile = { ...room.pile, status: "won", winner: "left", game: "pile", leftScore: 5 };
  room.drop = { ...room.drop, holder: "nova" };
  const stripped = stripBotPrize(room);
  assert.equal(stripped.pile.status, "open");
  assert.equal(stripped.drop.holder, null);
});

test("a human who runs it back opens the next round in the same seats", () => {
  let state = houseRoom();
  state.people = [
    { handle: "alice", link: "https://alice.room" },
    { handle: "nova", link: "https://nova.room" },
  ];
  state.seats = { left: "alice", right: "nova" };
  for (let i = 0; i < 5; i += 1) state = pileOn(state, "left").state;
  assert.equal(state.pile.status, "won");
  state.rematch = { alice: "back" };
  const next = houseBeat(state, 0, now).state;
  assert.equal(next.pile.status, "open");
  assert.equal(next.pile.leftScore, 0);
  assert.equal(next.seats.left, "alice");
  assert.equal(next.seats.right, "nova");
  assert.equal(next.rematch.alice, undefined);
});

test("stepping out stays out and the queue starts the next round", () => {
  let state = houseRoom();
  state.people = [
    { handle: "alice", link: "https://alice.room" },
    { handle: "nova", link: "https://nova.room" },
  ];
  state.seats = { left: "alice", right: "nova" };
  for (let i = 0; i < 5; i += 1) state = pileOn(state, "left").state;
  state = stepOut(state, "alice").state;
  state = join(state, { handle: "bob", link: "https://bob.room" }).state;
  state.you = null;
  state = enqueue(state, { handle: "bob", game: "pile", at: now - 10 }).state;
  const next = run(50, state, 0, now).state;
  assert.equal(next.pile.status, "open");
  assert.notEqual(next.seats.left, "alice");
  assert.notEqual(next.seats.right, "alice");
  assert.ok(next.seats.left === "bob" || next.seats.right === "bob");
  assert.ok(isHouseBot(next.seats.left) || isHouseBot(next.seats.right));
  assert.equal((next.people || []).some((person) => person.handle === "alice"), false);
});

test("the roster and the line are capped, and bots return when players leave", () => {
  let state = houseRoom();
  let joined = 0;
  for (let i = 0; i < PEOPLE_CAP + 5; i += 1) {
    const handle = `p${i}`;
    const result = join(state, { handle, link: `https://${handle}.room` });
    if (!result.ok) {
      assert.equal(result.error, "The room is full.");
      break;
    }
    state = result.state;
    state.you = null;
    joined += 1;
  }
  assert.equal(state.people.length, PEOPLE_CAP);
  assert.ok(joined < PEOPLE_CAP + 5);

  state = houseRoom();
  for (let i = 0; i < QUEUE_CAP + 3; i += 1) {
    const handle = `q${i}`;
    state = join(state, { handle, link: `https://${handle}.room` }).state;
    state.you = null;
    const queued = enqueue(state, { handle, game: "pile", at: now - 10 });
    if (!queued.ok) {
      assert.equal(queued.error, "The line is full.");
      break;
    }
    state = queued.state;
  }
  assert.equal(state.queue.length, QUEUE_CAP);
  state.queue = [];
  state.seats = { left: null, right: null };
  state.pile = { ...state.pile, status: "open", winner: null, game: null };
  state.you = null;
  const empty = staffHouse(state, now);
  assert.deepEqual(botsIn(empty), ["nova", "jun"]);
  assert.equal(empty.people.length, 2);
});

test("the scripted crowd still runs when the room is full of the cast", () => {
  const next = crowdBeat(fillRoom(), 0, now);
  assert.equal(next.beat, 1);
  assert.equal(next.state.people.length, 22);
});
