import test from "node:test";
import assert from "node:assert/strict";
import {
  seedRoom,
  join,
  say,
  focusDrop,
  lockDrop,
  pileOn,
  resetPile,
  enterLine,
  voteLine,
  armLane,
  tapLane,
  pileLine,
  roundLine,
  wall,
  revive,
  VIBE_CAP,
  WALL_SHOW,
} from "../js/room.mjs";
import { readRoom, writeRoom, STORAGE_KEY } from "../js/persist.mjs";

test("join puts you at the front and keeps one handle", () => {
  const first = join(seedRoom(), { handle: "  Nova ", link: "https://nova.example" });
  assert.equal(first.ok, true);
  assert.equal(first.state.you.handle, "nova");
  assert.equal(first.state.people[0].link, "https://nova.example");
  assert.equal(first.state.people.filter((person) => person.handle === "nova").length, 1);
  const again = join(first.state, { handle: "NOVA", link: "https://new.example" });
  assert.equal(again.state.people.filter((person) => person.handle === "nova").length, 1);
  assert.equal(again.state.people[0].link, "https://new.example");
});

test("join rejects a missing handle or link", () => {
  assert.equal(join(seedRoom(), { handle: "  ", link: "x" }).ok, false);
  assert.equal(join(seedRoom(), { handle: "ace", link: "  " }).ok, false);
});

test("only people in the room can leave a vibe", () => {
  const outsider = say(seedRoom(), { handle: "ghost", text: "hello" });
  assert.equal(outsider.ok, false);
  const said = say(seedRoom(), { handle: "Kit", text: "  bring the ugly drums  " });
  assert.equal(said.ok, true);
  assert.equal(said.state.vibes[0].text, "bring the ugly drums");
  assert.equal(said.state.vibes[0].handle, "kit");
  assert.equal(wall(said.state).length, WALL_SHOW);
});

test("vibes stay one line and the wall does not grow forever", () => {
  assert.equal(say(seedRoom(), { handle: "nova", text: "" }).ok, false);
  assert.equal(say(seedRoom(), { handle: "nova", text: "x".repeat(81) }).ok, false);
  let state = seedRoom();
  for (let i = 0; i < 20; i += 1) {
    state = say(state, { handle: "nova", text: `line ${i}` }).state;
  }
  assert.equal(state.vibes.length, VIBE_CAP);
  assert.equal(state.vibes[0].text, "line 19");
});

test("first to five keeps the drop and extra taps do nothing", () => {
  let state = seedRoom();
  state = pileOn(state, "right").state;
  for (let i = 0; i < 6; i += 1) state = pileOn(state, "left").state;
  assert.equal(state.pile.leftScore, 5);
  assert.equal(state.pile.rightScore, 1);
  assert.equal(state.pile.status, "won");
  assert.equal(state.pile.winner, "left");
  assert.equal(state.drop.holder, "nova");
  assert.equal(pileLine(state), "Nova keeps Bold Condensed.");
  const extra = pileOn(state, "right");
  assert.equal(extra.ok, false);
  assert.equal(extra.state.pile.rightScore, 1);
});

test("a lock only lands before versus starts", () => {
  const joined = join(seedRoom(), { handle: "ace", link: "https://ace.example" }).state;
  const locked = lockDrop(joined, "ace");
  assert.equal(locked.ok, true);
  assert.equal(locked.state.drop.holder, "ace");
  assert.equal(locked.state.pile.status, "locked");
  assert.equal(pileOn(locked.state, "left").ok, false);
  let started = pileOn(seedRoom(), "left").state;
  assert.equal(lockDrop(started, "nova").ok, false);
  assert.equal(started.pile.leftScore, 1);
});

test("focusing a new drop while the round is open resets the score", () => {
  let state = pileOn(seedRoom(), "left").state;
  const moved = focusDrop(state, "j190");
  assert.equal(moved.ok, true);
  assert.equal(moved.state.drop.name, "J190.WAV");
  assert.equal(moved.state.pile.leftScore, 0);
  assert.equal(moved.state.pile.status, "open");
  state = pileOn(state, "left").state;
  state = pileOn(state, "left").state;
  state = pileOn(state, "left").state;
  state = pileOn(state, "left").state;
  state = pileOn(state, "left").state;
  assert.equal(focusDrop(state, "list").ok, false);
  assert.equal(state.drop.id, "bold");
});

test("reset opens a fresh round and clears the holder", () => {
  let state = seedRoom();
  for (let i = 0; i < 5; i += 1) state = pileOn(state, "right").state;
  state = resetPile(state).state;
  assert.equal(state.pile.status, "open");
  assert.equal(state.pile.rightScore, 0);
  assert.equal(state.drop.holder, null);
  assert.equal(pileLine(state), "Bold Condensed is up.");
});

test("revive drops a broken save and keeps a real round", () => {
  assert.equal(revive(null).drop.id, "bold");
  assert.equal(revive({ version: 1 }).people[0].handle, "nova");
  const saved = pileOn(pileOn(seedRoom(), "left").state, "right").state;
  const back = revive(JSON.parse(JSON.stringify(saved)));
  assert.equal(back.pile.leftScore, 1);
  assert.equal(back.pile.rightScore, 1);
  assert.equal(back.pile.status, "open");
  assert.equal(back.drop.holder, null);
});

test("best line needs both lines, then first to five keeps the drop", () => {
  let state = enterLine(seedRoom(), "left", "  mean in a good way ").state;
  assert.equal(voteLine(state, "left").ok, false);
  state = enterLine(state, "right", "too polite").state;
  assert.equal(pileOn(state, "left").ok, false);
  for (let i = 0; i < 6; i += 1) state = voteLine(state, "left").state;
  assert.equal(state.line.leftVotes, 5);
  assert.equal(state.pile.status, "won");
  assert.equal(state.drop.holder, "nova");
  assert.equal(enterLine(state, "right", "too late").ok, false);
});

test("a started line blocks a lock, and a started pile blocks a line", () => {
  const lined = enterLine(seedRoom(), "left", "one line").state;
  assert.equal(lockDrop(lined, "nova").ok, false);
  const piled = pileOn(seedRoom(), "right").state;
  assert.equal(enterLine(piled, "left", "nope").ok, false);
  assert.equal(enterLine(seedRoom(), "left", "   ").ok, false);
});

test("the closer tap keeps the drop, and a tie runs the lane again", () => {
  let state = armLane(seedRoom(), 40).state;
  state = tapLane(state, "left", 44).state;
  assert.equal(state.pile.status, "open");
  assert.equal(tapLane(state, "left", 10).ok, false);
  state = tapLane(state, "right", 90).state;
  assert.equal(state.pile.winner, "left");
  assert.equal(state.drop.holder, "nova");
  assert.equal(roundLine(state), "Nova keeps Bold Condensed.");

  let tie = armLane(seedRoom(), 50).state;
  tie = tapLane(tie, "left", 40).state;
  tie = tapLane(tie, "right", 60).state;
  assert.equal(tie.pile.status, "open");
  assert.equal(tie.lane.leftTap, null);
  assert.equal(tie.lane.rightTap, null);
  assert.equal(tie.pile.game, "lane");
});

test("reset clears every game, and an old save still revives", () => {
  let state = enterLine(enterLine(seedRoom(), "left", "a").state, "right", "b").state;
  state = resetPile(state).state;
  assert.equal(state.pile.game, null);
  assert.equal(state.line.leftText, "");
  assert.equal(state.lane.leftTap, null);
  const legacy = {
    version: 1,
    people: [{ handle: "nova", link: "" }],
    drop: { id: "bold", holder: null },
    pile: { leftScore: 2, rightScore: 0, status: "open", winner: null },
    vibes: [{ handle: "nova", text: "still here" }],
  };
  const back = revive(legacy);
  assert.equal(back.version, 2);
  assert.equal(back.pile.leftScore, 2);
  assert.equal(back.pile.game, "pile");
  assert.equal(back.line.leftText, "");
});

test("the save adapter roundtrips through a storage object", () => {
  const memory = new Map();
  const storage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  };
  assert.equal(readRoom(storage).you, null);
  const joined = join(seedRoom(), { handle: "ace", link: "https://ace.example" }).state;
  writeRoom(storage, joined);
  assert.ok(memory.get(STORAGE_KEY).includes("ace"));
  const loaded = readRoom(storage);
  assert.equal(loaded.you.handle, "ace");
  assert.equal(loaded.people[0].link, "https://ace.example");
  memory.set(STORAGE_KEY, "{");
  assert.equal(readRoom(storage).drop.id, "bold");
});
