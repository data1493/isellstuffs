import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  DONATE_RECEIVE_WALLETS,
  DONATE_XRP_MEMO,
  donateEthAddress,
  donateUsdtAddress,
} from "./donate-wallets";

test("six public receive strings stay character-exact", () => {
  assert.equal(DONATE_RECEIVE_WALLETS.length, 6);
  assert.deepEqual(
    DONATE_RECEIVE_WALLETS.map((row) => row.id),
    ["sol", "eth", "xrp", "btc", "usdt", "doge"],
  );

  const byId = Object.fromEntries(
    DONATE_RECEIVE_WALLETS.map((row) => [row.id, row]),
  );

  assert.equal(
    byId.sol.address,
    "AyWQjwqu4sSDk5YN6W769ya2fqaNo9JNrvs6dENV8cqx",
  );
  assert.equal(
    byId.eth.address,
    "0xc83584087C888829F40bAbD558CFD21FFba880fE",
  );
  assert.equal(byId.xrp.address, "rwnYLUsoBQX3ECa1A5bSKLdbPoHKnqf63J");
  assert.equal(byId.btc.address, "34FySBLQewD3scC6kYLHZ5t2RJkCbkKbB8");
  assert.equal(
    byId.usdt.address,
    "0xBaA226F7ceC5622e35752A148E0e4bf2988Ec00d",
  );
  assert.equal(byId.doge.address, "DRuGi348xvKAoFAP8edWUkVgSTLpj654L1");
});

test("XRP memo is required and copied separately from the address", () => {
  const xrp = DONATE_RECEIVE_WALLETS.find((row) => row.id === "xrp");
  assert.ok(xrp);
  assert.equal(DONATE_XRP_MEMO, "311351780");
  assert.equal("memo" in xrp && xrp.memo, "311351780");
  assert.equal("memoRequired" in xrp && xrp.memoRequired, true);
  assert.notEqual(xrp.address, DONATE_XRP_MEMO);
});

test("USDT is ERC-20 only and a different 0x from ETH", () => {
  const usdt = DONATE_RECEIVE_WALLETS.find((row) => row.id === "usdt");
  assert.ok(usdt);
  assert.equal(usdt.network, "ERC-20");
  assert.equal("erc20Only" in usdt && usdt.erc20Only, true);
  assert.notEqual(donateEthAddress(), donateUsdtAddress());
  assert.match(donateEthAddress(), /^0x/);
  assert.match(donateUsdtAddress(), /^0x/);
});

test("module source has no secret material", () => {
  const source = readFileSync(
    join(process.cwd(), "src/lib/donate-wallets.ts"),
    "utf8",
  );
  assert.doesNotMatch(source, /mnemonic/i);
  assert.doesNotMatch(source, /seed phrase/i);
  assert.doesNotMatch(source, /BEGIN (EC |OPENSSH |RSA )?PRIVATE KEY/);
  assert.doesNotMatch(source, /0x[0-9a-fA-F]{64}/);
});
