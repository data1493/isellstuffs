import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import {
  CONTENTS_COOKIE_NAME,
  CONTENTS_NOTICE_TITLE,
  CONTENTS_STORAGE_KEY,
  canTapeContents,
  clearListingContents,
  contentsCookieValue,
  isListingContentsOverlay,
  markListingContents,
  parseContentsListingIds,
} from "./listing-contents";

test("cookie and storage keys stay the contents paper names", () => {
  assert.equal(CONTENTS_STORAGE_KEY, "iss:contents-listing-ids");
  assert.equal(CONTENTS_COOKIE_NAME, "iss-contents-listing-ids");
  assert.equal(
    CONTENTS_NOTICE_TITLE,
    "I will not list what’s on it. Still Sharpie. Still scratched.",
  );
});

test("write-result objects never parse as a contents set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["ysk-burned-cdr"],
  });
  assert.deepEqual(parseContentsListingIds(writeResult), []);
  assert.equal(
    isListingContentsOverlay(
      "ysk-burned-cdr",
      parseContentsListingIds(writeResult),
    ),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = contentsCookieValue(["ysk-burned-cdr", "ysk-burned-cdr", ""]);
  assert.equal(raw, '["ysk-burned-cdr"]');
  assert.deepEqual(parseContentsListingIds(raw), ["ysk-burned-cdr"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("physical CD-R tapes; pack, font, mixtape, and lamp stay off that cookie", () => {
  const disc = listingById("ysk-burned-cdr");
  const pack = listingById("dl-sample-pack");
  const font = listingById("dl-booth-font");
  const mixtape = listingById("mdb-mixtape-93");
  const lamp = listingById("ysk-wobbly-lamp");

  assert.ok(canTapeContents(disc));
  assert.equal(canTapeContents(pack), false);
  assert.equal(canTapeContents(font), false);
  assert.ok(canTapeContents(mixtape));
  assert.ok(canTapeContents(lamp));

  const taped = markListingContents(disc, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  assert.equal(contentsCookieValue(taped!), '["ysk-burned-cdr"]');
  assert.equal(isListingContentsOverlay("ysk-burned-cdr", taped!), true);
  assert.equal(isListingContentsOverlay("dl-sample-pack", taped!), false);
  assert.equal(isListingContentsOverlay("dl-booth-font", taped!), false);
  assert.equal(isListingContentsOverlay("mdb-mixtape-93", taped!), false);
  assert.equal(isListingContentsOverlay("ysk-wobbly-lamp", taped!), false);
});

test("sample pack, booth font, gift, chair, and stain zine refuse a contents write", () => {
  const pack = listingById("dl-sample-pack");
  const font = listingById("dl-booth-font");
  const gift = listingById("dl-mall-gift-card");
  const chair = listingById("ysk-folding-chair");
  const zine = listingById("dl-stain-zine");

  assert.equal(canTapeContents(pack), false);
  assert.equal(canTapeContents(font), false);
  assert.equal(canTapeContents(gift), false);
  assert.equal(canTapeContents(chair), false);
  assert.equal(canTapeContents(zine), false);

  assert.equal(markListingContents(pack, []), null);
  assert.equal(markListingContents(font, []), null);
  assert.equal(markListingContents(gift, []), null);
  assert.equal(markListingContents(chair, []), null);
  assert.equal(markListingContents(zine, []), null);
});

test("tape does not rewrite price, status, or tote eligibility", () => {
  const disc = listingById("ysk-burned-cdr");
  assert.ok(disc);
  const before = {
    price: disc.price,
    status: disc.status,
    cartEligible: disc.cartEligible,
  };
  const taped = markListingContents(disc, []);
  assert.deepEqual(taped, ["ysk-burned-cdr"]);
  const after = listingById("ysk-burned-cdr");
  assert.deepEqual(after?.price, before.price);
  assert.equal(after?.status, before.status);
  assert.equal(after?.cartEligible, before.cartEligible);
});

test("clear peels only that CD-R id", () => {
  const disc = listingById("ysk-burned-cdr");
  const mixtape = listingById("mdb-mixtape-93");
  const taped = markListingContents(mixtape, ["ysk-burned-cdr"]);
  assert.deepEqual(taped, ["ysk-burned-cdr", "mdb-mixtape-93"]);
  const cleared = clearListingContents(disc, taped!);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, ["mdb-mixtape-93"]);
  assert.equal(contentsCookieValue(cleared!), '["mdb-mixtape-93"]');
  assert.equal(isListingContentsOverlay("ysk-burned-cdr", cleared!), false);
});

test("mark and clear never return a write-result object", () => {
  const disc = listingById("ysk-burned-cdr");
  const pack = listingById("dl-sample-pack");
  const taped = markListingContents(disc, []);
  const refused = markListingContents(pack, []);
  const cleared = clearListingContents(disc, taped ?? []);

  assert.ok(Array.isArray(taped));
  assert.equal(taped && "ok" in (taped as object), false);
  assert.equal(refused, null);
  assert.ok(Array.isArray(cleared));
  assert.equal(cleared && "ok" in (cleared as object), false);
});
