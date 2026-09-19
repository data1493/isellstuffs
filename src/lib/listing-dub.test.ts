import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import {
  DUB_COOKIE_NAME,
  DUB_NOTICE_TITLE,
  DUB_STORAGE_KEY,
  canTapeDub,
  clearListingDub,
  dubCookieValue,
  isListingDubOverlay,
  markListingDub,
  parseDubListingIds,
} from "./listing-dub";

test("cookie and storage keys stay the dub paper names", () => {
  assert.equal(DUB_STORAGE_KEY, "iss:dub-listing-ids");
  assert.equal(DUB_COOKIE_NAME, "iss-dub-listing-ids");
  assert.equal(
    DUB_NOTICE_TITLE,
    "I will not dub it. Still hiss. Still a radio edit.",
  );
});

test("write-result objects never parse as a dub set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["mdb-mixtape-93"],
  });
  assert.deepEqual(parseDubListingIds(writeResult), []);
  assert.equal(
    isListingDubOverlay("mdb-mixtape-93", parseDubListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = dubCookieValue(["mdb-mixtape-93", "mdb-mixtape-93", ""]);
  assert.equal(raw, '["mdb-mixtape-93"]');
  assert.deepEqual(parseDubListingIds(raw), ["mdb-mixtape-93"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("physical mixtape tapes; LP, jewels, and CD-R stay off that cookie", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const lp = listingById("mdb-scratched-lp");
  const jewels = listingById("mdb-jewel-stack");
  const disc = listingById("ysk-burned-cdr");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.ok(canTapeDub(mixtape));
  assert.ok(canTapeDub(lp));
  assert.ok(canTapeDub(jewels));
  assert.ok(canTapeDub(disc));
  assert.ok(canTapeDub(lamp));

  const taped = markListingDub(mixtape, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  assert.equal(dubCookieValue(taped!), '["mdb-mixtape-93"]');
  assert.equal(isListingDubOverlay("mdb-mixtape-93", taped!), true);
  assert.equal(isListingDubOverlay("mdb-scratched-lp", taped!), false);
  assert.equal(isListingDubOverlay("mdb-jewel-stack", taped!), false);
  assert.equal(isListingDubOverlay("ysk-burned-cdr", taped!), false);
  assert.equal(isListingDubOverlay("ysk-wobbly-lamp", taped!), false);
});

test("liner PDF, gift, chair, and stain zine refuse a dub write", () => {
  const liner = listingById("dl-crate-side-a");
  const gift = listingById("dl-mall-gift-card");
  const chair = listingById("ysk-folding-chair");
  const zine = listingById("dl-stain-zine");

  assert.equal(canTapeDub(liner), false);
  assert.equal(canTapeDub(gift), false);
  assert.equal(canTapeDub(chair), false);
  assert.equal(canTapeDub(zine), false);

  assert.equal(markListingDub(liner, []), null);
  assert.equal(markListingDub(gift, []), null);
  assert.equal(markListingDub(chair, []), null);
  assert.equal(markListingDub(zine, []), null);
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const mixtape = listingById("mdb-mixtape-93");
  assert.ok(mixtape);
  const before = {
    price: mixtape.price,
    status: mixtape.status,
    cartEligible: mixtape.cartEligible,
  };
  const taped = markListingDub(mixtape, []);
  assert.deepEqual(taped, ["mdb-mixtape-93"]);
  const after = listingById("mdb-mixtape-93");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that mixtape id", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const lamp = listingById("ysk-wobbly-lamp");
  const taped = markListingDub(lamp, ["mdb-mixtape-93"]);
  assert.deepEqual(taped, ["mdb-mixtape-93", "ysk-wobbly-lamp"]);
  const cleared = clearListingDub(mixtape, taped!);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, ["ysk-wobbly-lamp"]);
  assert.equal(dubCookieValue(cleared!), '["ysk-wobbly-lamp"]');
  assert.equal(isListingDubOverlay("mdb-mixtape-93", cleared!), false);
});

test("mark and clear never return a write-result object", () => {
  const mixtape = listingById("mdb-mixtape-93");
  const liner = listingById("dl-crate-side-a");
  const taped = markListingDub(mixtape, []);
  const refused = markListingDub(liner, []);
  const cleared = clearListingDub(mixtape, taped ?? []);

  assert.ok(Array.isArray(taped));
  assert.equal(taped && "ok" in (taped as object), false);
  assert.equal(refused, null);
  assert.ok(Array.isArray(cleared));
  assert.equal(cleared && "ok" in (cleared as object), false);
});
