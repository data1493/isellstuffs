"use client";

import { useEffect } from "react";

import {
  EARLY_FOLD_STORAGE_KEY,
  mergeEarlyFoldMaps,
  readEarlyFold,
  serializeEarlyFold,
  type EarlyFoldMap,
} from "@/lib/early-fold";

/** Copy the cookie cork into `iss:early-fold` after a no-JS tape. */
export function SyncEarlyFold({ map }: { map: EarlyFoldMap }) {
  useEffect(() => {
    try {
      const next = mergeEarlyFoldMaps(readEarlyFold(), map);
      window.localStorage.setItem(
        EARLY_FOLD_STORAGE_KEY,
        serializeEarlyFold(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
