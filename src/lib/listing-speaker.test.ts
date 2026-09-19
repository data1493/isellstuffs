import assert from "node:assert/strict";
import { test } from "node:test";

import { listingById } from "./commerce";
import {
  SPEAKER_COOKIE_NAME,
  SPEAKER_LEAVE_LINE,
  SPEAKER_NOTICE_TITLE,
  SPEAKER_STORAGE_KEY,
  canTapeSpeaker,
  clearListingSpeaker,
  isListingSpeakerOverlay,
  markListingSpeaker,
  parseSpeakerListingIds,
  speakerCookieValue,
} from "./listing-speaker";

test("cookie and storage keys stay the speaker paper names", () => {
  assert.equal(SPEAKER_STORAGE_KEY, "iss:speaker-listing-ids");
  assert.equal(SPEAKER_COOKIE_NAME, "iss-speaker-listing-ids");
  assert.equal(
    SPEAKER_NOTICE_TITLE,
    "I will not speaker it. Still a line. Still fused.",
  );
  assert.equal(SPEAKER_LEAVE_LINE, "Leave the line");
});

test("write-result objects never parse as a speaker set", () => {
  const writeResult = JSON.stringify({
    ok: true,
    listingIds: ["gtk-game-boy"],
  });
  assert.deepEqual(parseSpeakerListingIds(writeResult), []);
  assert.equal(
    isListingSpeakerOverlay("gtk-game-boy", parseSpeakerListingIds(writeResult)),
    false,
  );
});

test("cookie value is always a string array", () => {
  const raw = speakerCookieValue(["gtk-game-boy", "gtk-game-boy", ""]);
  assert.equal(raw, '["gtk-game-boy"]');
  assert.deepEqual(parseSpeakerListingIds(raw), ["gtk-game-boy"]);
  assert.ok(Array.isArray(JSON.parse(raw)));
  assert.equal("ok" in JSON.parse(raw), false);
});

test("Game Boy tapes; drawer stays off that cookie", () => {
  const boy = listingById("gtk-game-boy");
  const drawer = listingById("gtk-cable-drawer");
  assert.ok(canTapeSpeaker(boy));
  assert.ok(canTapeSpeaker(drawer));

  const taped = markListingSpeaker(boy, []);
  assert.ok(Array.isArray(taped));
  assert.deepEqual(taped, ["gtk-game-boy"]);
  assert.equal(speakerCookieValue(taped), '["gtk-game-boy"]');
  assert.equal(isListingSpeakerOverlay("gtk-game-boy", taped), true);
  assert.equal(isListingSpeakerOverlay("gtk-cable-drawer", taped), false);
  assert.equal(boy?.cartEligible, true);
  assert.equal(boy?.status, "available");
  assert.equal(boy?.price.amountCents, 2800);
});

test("LUTs, sample pack, gift, chair, and stain zine refuse a speaker write", () => {
  const luts = listingById("dl-camera-luts");
  const pack = listingById("dl-sample-pack");
  const gift = listingById("dl-mall-gift-card");
  const chair = listingById("ysk-folding-chair");
  const zine = listingById("dl-stain-zine");

  assert.equal(canTapeSpeaker(luts), false);
  assert.equal(canTapeSpeaker(pack), false);
  assert.equal(canTapeSpeaker(gift), false);
  assert.equal(canTapeSpeaker(chair), false);
  assert.equal(canTapeSpeaker(zine), false);

  assert.equal(markListingSpeaker(luts, []), null);
  assert.equal(markListingSpeaker(pack, []), null);
  assert.equal(markListingSpeaker(gift, []), null);
  assert.equal(markListingSpeaker(chair, []), null);
  assert.equal(markListingSpeaker(zine, []), null);
  assert.equal(chair?.status, "sold");
});

test("clear peels only that Game Boy id", () => {
  const boy = listingById("gtk-game-boy");
  const cleared = clearListingSpeaker(boy, ["gtk-game-boy"]);
  assert.ok(Array.isArray(cleared));
  assert.deepEqual(cleared, []);
  assert.equal(speakerCookieValue(cleared), "[]");
  assert.equal(isListingSpeakerOverlay("gtk-game-boy", cleared), false);
});

test("mark and clear never return a write-result object", () => {
  const boy = listingById("gtk-game-boy");
  const taped = markListingSpeaker(boy, []);
  assert.ok(taped);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "ok"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(taped, "listingIds"), false);

  const cleared = clearListingSpeaker(boy, taped);
  assert.ok(cleared);
  assert.equal(Object.prototype.hasOwnProperty.call(cleared, "ok"), false);
});
