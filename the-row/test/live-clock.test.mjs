import test from "node:test";
import assert from "node:assert/strict";
import { fillRoom } from "../js/crowd.mjs";
import { advanceLive, BEAT_MS, MAX_CATCHUP } from "../js/live-clock.mjs";

function fresh(tickAt = 0) {
  return { state: fillRoom(), beat: 0, tickAt };
}

test("a quiet clock does not move the room", () => {
  const live = fresh(0);
  const same = advanceLive(live, 0, true);
  assert.equal(same.changed, false);
  assert.equal(same.live, live);
  const off = advanceLive(live, BEAT_MS * 4, false);
  assert.equal(off.changed, false);
  assert.equal(off.live.beat, 0);
});

test("the crowd steps once per beat and snaps after a long gap", () => {
  const moved = advanceLive(fresh(0), BEAT_MS * 2, true);
  assert.equal(moved.changed, true);
  assert.equal(moved.live.beat, 2);
  assert.equal(moved.live.tickAt, BEAT_MS * 2);
  assert.notEqual(moved.live.state.people[0].handle, fresh(0).state.people[0].handle);

  const far = advanceLive(fresh(0), BEAT_MS * 100, true);
  assert.equal(far.live.beat, MAX_CATCHUP);
  assert.equal(far.live.tickAt, BEAT_MS * 100);
});
