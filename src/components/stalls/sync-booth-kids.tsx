"use client";

import { useEffect } from "react";

import {
  BOOTH_KIDS_STORAGE_KEY,
  mergeBoothKidsMaps,
  readBoothKids,
  serializeBoothKids,
  type BoothKidsMap,
} from "@/lib/booth-kids";

/** Copy the cookie cork into `iss:booth-kids` after a no-JS tape. */
export function SyncBoothKids({ map }: { map: BoothKidsMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothKidsMaps(readBoothKids(), map);
      window.localStorage.setItem(
        BOOTH_KIDS_STORAGE_KEY,
        serializeBoothKids(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
