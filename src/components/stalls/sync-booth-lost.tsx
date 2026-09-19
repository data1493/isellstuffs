"use client";

import { useEffect } from "react";

import {
  BOOTH_LOST_STORAGE_KEY,
  mergeBoothLost,
  readBoothLost,
  serializeBoothLost,
  type LostTitle,
} from "@/lib/booth-lost";

/** Copy the cookie pile into `iss:booth-lost` after a no-JS tape. */
export function SyncBoothLost({ titles }: { titles: LostTitle[] }) {
  useEffect(() => {
    try {
      const next = mergeBoothLost(readBoothLost(), titles);
      window.localStorage.setItem(
        BOOTH_LOST_STORAGE_KEY,
        serializeBoothLost(next),
      );
    } catch {
      // blocked storage
    }
  }, [titles]);

  return null;
}
