import { stallById } from "@/lib/commerce";
import type { StallCardPatch } from "@/lib/stall-overlay";

export type StallCardError = {
  ok: false;
  error: string;
};

export type StallCardOk = {
  ok: true;
  patch: StallCardPatch;
};

export type StallCardResult = StallCardOk | StallCardError;

const NAME_MAX = 72;
const BLURB_MAX = 240;

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function parseStallCard(formData: FormData): StallCardResult {
  const stallId = readString(formData, "stallId");
  const boothName = readString(formData, "boothName");
  const blurb = readString(formData, "blurb");

  const stall = stallById(stallId);
  if (!stall) {
    return {
      ok: false,
      error: "That stall is not on this floor. You can only rewrite a booth that already exists.",
    };
  }

  if (boothName.length < 2) {
    return { ok: false, error: "Name the booth. A stall without a name is a username." };
  }

  if (boothName.length > NAME_MAX) {
    return {
      ok: false,
      error: "Shorter name. This is a folding-table card, not a storefront.",
    };
  }

  if (blurb.length < 8) {
    return {
      ok: false,
      error: "Give the booth a pitch. One honest breath is enough.",
    };
  }

  if (blurb.length > BLURB_MAX) {
    return {
      ok: false,
      error: "Shorter blurb. Shoppers read this while walking past.",
    };
  }

  return {
    ok: true,
    patch: {
      stallId: stall.id,
      boothName,
      blurb,
    },
  };
}
