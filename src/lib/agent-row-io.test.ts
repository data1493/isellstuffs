import assert from "node:assert/strict";
import { test } from "node:test";

import { formatAgentTradeSplit } from "./agent-row-io";

test("$20 lot prints ask, 10% mall cut, and net to seller", () => {
  const split = formatAgentTradeSplit(2000, 200);
  assert.equal(split.ask, "$20.00");
  assert.equal(split.cut, "$2.00");
  assert.equal(split.net, "$18.00");
});
