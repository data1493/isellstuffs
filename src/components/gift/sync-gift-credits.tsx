"use client";

import { useEffect } from "react";

import {
  GIFT_CREDITS_STORAGE_KEY,
  mergeGiftCredits,
  readGiftCredits,
  serializeGiftCredits,
  type GiftCredit,
} from "@/lib/gift-desk";

/** Copy the cookie slip into `iss:gift-credits` after a no-JS redeem. */
export function SyncGiftCredits({ credits }: { credits: GiftCredit[] }) {
  useEffect(() => {
    try {
      const next = mergeGiftCredits(readGiftCredits(), credits);
      window.localStorage.setItem(
        GIFT_CREDITS_STORAGE_KEY,
        serializeGiftCredits(next),
      );
    } catch {
      // blocked storage
    }
  }, [credits]);

  return null;
}
