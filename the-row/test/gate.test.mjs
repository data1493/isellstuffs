import test from "node:test";
import assert from "node:assert/strict";
import { matchToken } from "../js/gate.mjs";
import { fillRoom } from "../js/crowd.mjs";

test("the match token changes when the game or the drop changes", () => {
  const room = fillRoom();
  assert.equal(matchToken(room), "open:bold:open");
  room.pile.game = "line";
  assert.equal(matchToken(room), "line:bold:open");
  room.drop = { ...room.drop, id: "j190" };
  assert.equal(matchToken(room), "line:j190:open");
  room.pile.status = "won";
  assert.equal(matchToken(room), "line:j190:won");
});
