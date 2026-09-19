"use client";

import { useEffect } from "react";

import {
  BOOTH_BULB_STORAGE_KEY,
  mergeBoothBulbMaps,
  readBoothBulb,
  serializeBoothBulb,
  type BoothBulbMap,
} from "@/lib/booth-bulb";

/** Copy the cookie cork into `iss:booth-bulb` after a no-JS tape. */
export function SyncBoothBulb({ map }: { map: BoothBulbMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothBulbMaps(readBoothBulb(), map);
      window.localStorage.setItem(
        BOOTH_BULB_STORAGE_KEY,
        serializeBoothBulb(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
