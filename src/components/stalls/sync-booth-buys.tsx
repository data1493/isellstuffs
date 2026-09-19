"use client";

import { useEffect } from "react";

import {
  BOOTH_BUYS_STORAGE_KEY,
  mergeBoothBuys,
  readBoothBuys,
  serializeBoothBuys,
  type BuyTitle,
} from "@/lib/booth-buys";

/** Copy the cookie pile into `iss:booth-buys` after a no-JS tape. */
export function SyncBoothBuys({ titles }: { titles: BuyTitle[] }) {
  useEffect(() => {
    try {
      const next = mergeBoothBuys(readBoothBuys(), titles);
      window.localStorage.setItem(
        BOOTH_BUYS_STORAGE_KEY,
        serializeBoothBuys(next),
      );
    } catch {
      // blocked storage
    }
  }, [titles]);

  return null;
}
