"use client";

import { useEffect } from "react";

import {
  mergeStallScraps,
  readStallScraps,
  serializeStallScraps,
  STALL_SCRAP_STORAGE_KEY,
  type StallScrap,
} from "@/lib/stall-scrap";

/** Copy the cookie cork into `iss:stall-scraps` after a no-JS tape. */
export function SyncScraps({ scraps }: { scraps: StallScrap[] }) {
  useEffect(() => {
    try {
      const next = mergeStallScraps(readStallScraps(), scraps);
      window.localStorage.setItem(
        STALL_SCRAP_STORAGE_KEY,
        serializeStallScraps(next),
      );
    } catch {
      // blocked storage
    }
  }, [scraps]);

  return null;
}
