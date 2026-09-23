import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, test } from "node:test";

import {
  agentTradeFeeCents,
  agentTradeNetCents,
  confirmTrade,
  insertLot,
  insertPledge,
  insertSuggestion,
  insertTrade,
  listLots,
  listPledges,
  listRatingsForHandle,
  listSuggestions,
  mallCutThisAisle,
  rateAgent,
  readPass,
  resetAgentStoreMemory,
  usesDatabase,
  voidTrade,
  writePass,
} from "./agent-store";

afterEach(() => {
  delete process.env.DATABASE_URL;
  resetAgentStoreMemory();
});

test("cookie is the default when DATABASE_URL is unset", async () => {
  delete process.env.DATABASE_URL;
  resetAgentStoreMemory();
  assert.equal(usesDatabase(), false);

  const wrote = await writePass({
    handle: "aisle-bot",
    publicAddress: "0xISS0000aisle",
  });
  assert.equal(wrote.ok, true);
  if (!wrote.ok) return;
  assert.equal(wrote.value?.handle, "aisle-bot");
  assert.equal((await readPass())?.handle, "aisle-bot");

  const listed = await insertLot({
    sellerHandle: "aisle-bot",
    title: "crate of stems",
    askCents: 2000,
    asset: "usdc",
  });
  assert.equal(listed.ok, true);
  if (!listed.ok) return;
  assert.equal(agentTradeFeeCents(2000), 200);
  assert.equal(agentTradeNetCents(2000), 1800);

  const lots = await listLots();
  assert.equal(lots.length, 1);

  const taken = await insertTrade({
    lotId: listed.value.id,
    takerHandle: "crate-bot",
  });
  assert.equal(taken.ok, true);
  if (!taken.ok) return;
  assert.equal(taken.value.feeCents, 200);
  assert.equal(agentTradeNetCents(taken.value.askCents, taken.value.feeCents), 1800);
  assert.equal(taken.value.status, "taken");
  assert.equal((await listLots()).length, 0);

  const confirmed = await confirmTrade(taken.value.id);
  assert.equal(confirmed.ok, true);
  assert.equal(await mallCutThisAisle(), 200);

  const rated = await rateAgent({
    fromHandle: "crate-bot",
    about: "pass",
    aboutHandle: "aisle-bot",
    stars: 4,
    body: "clean take",
  });
  assert.equal(rated.ok, true);
  const about = await listRatingsForHandle("aisle-bot");
  assert.equal(about.length, 1);
  assert.equal(about[0]?.stars, 4);

  const suggestion = await insertSuggestion({
    fromHandle: "crate-bot",
    body: "print the cut on the slip",
  });
  assert.equal(suggestion.ok, true);
  assert.equal((await listSuggestions()).length, 1);

  const pledge = await insertPledge({
    method: "zelle",
    amountCents: 500,
    from: "human",
  });
  assert.equal(pledge.ok, true);
  assert.equal((await listPledges()).length, 1);
});

test("rejects private-key material, catalog physicals, and $501 asks", async () => {
  const key = await writePass({
    handle: "aisle-bot",
    publicAddress: "word ".repeat(12).trim(),
  });
  assert.equal(key.ok, false);
  if (key.ok) return;
  assert.equal(key.reason, "private-key");

  const physical = await insertLot({
    sellerHandle: "aisle-bot",
    title: "ysk-wobbly-lamp",
    askCents: 2000,
    asset: "usdc",
  });
  assert.equal(physical.ok, false);
  if (physical.ok) return;
  assert.equal(physical.reason, "physical");

  const big = await insertLot({
    sellerHandle: "aisle-bot",
    title: "crate of stems",
    askCents: 50100,
    asset: "usdc",
  });
  assert.equal(big.ok, false);
  if (big.ok) return;
  assert.equal(big.reason, "ask");
});

test("void before confirm returns the lot", async () => {
  await writePass({ handle: "aisle-bot", publicAddress: "0xISS0000aisle" });
  const listed = await insertLot({
    sellerHandle: "aisle-bot",
    title: "crate of stems",
    askCents: 2000,
    asset: "eth",
  });
  assert.equal(listed.ok, true);
  if (!listed.ok) return;
  const taken = await insertTrade({
    lotId: listed.value.id,
    takerHandle: "crate-bot",
  });
  assert.equal(taken.ok, true);
  if (!taken.ok) return;
  const voided = await voidTrade(taken.value.id);
  assert.equal(voided.ok, true);
  assert.equal((await listLots()).length, 1);
  const again = await confirmTrade(taken.value.id);
  assert.equal(again.ok, false);
});

test("sqlite DATABASE_URL shares lots across snapshots", async () => {
  const dir = mkdtempSync(join(tmpdir(), "agent-row-"));
  process.env.DATABASE_URL = `sqlite:${join(dir, "agent-row.db")}`;
  resetAgentStoreMemory();
  assert.equal(usesDatabase(), true);

  const a = await writePass({
    handle: "aisle-bot",
    publicAddress: "0xISS0000aisle",
  });
  assert.equal(a.ok, true);

  const listed = await insertLot({
    sellerHandle: "aisle-bot",
    title: "crate of stems",
    askCents: 2000,
    asset: "usdc",
  });
  assert.equal(listed.ok, true);

  const walkerB = { pass: null, lots: null, trades: null };
  const visible = await listLots(walkerB);
  assert.equal(visible.length, 1);
  assert.equal(visible[0]?.sellerHandle, "aisle-bot");
});
