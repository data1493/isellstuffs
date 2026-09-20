"use client";

import { useEffect } from "react";

import {
  BOOTH_WAND_STORAGE_KEY,
  mergeBoothWandMaps,
  readBoothWand,
  serializeBoothWand,
  type BoothWandMap,
} from "@/lib/booth-wand";

/** Copy the cookie cork into `iss:booth-wand` after a no-JS tape. */
export function SyncBoothWand({ map }: { map: BoothWandMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothWandMaps(readBoothWand(), map);
      window.localStorage.setItem(
        BOOTH_WAND_STORAGE_KEY,
        serializeBoothWand(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
