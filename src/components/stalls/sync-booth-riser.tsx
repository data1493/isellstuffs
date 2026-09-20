"use client";

import { useEffect } from "react";

import {
  BOOTH_RISER_STORAGE_KEY,
  mergeBoothRiserMaps,
  readBoothRiser,
  serializeBoothRiser,
  type BoothRiserMap,
} from "@/lib/booth-riser";

/** Copy the cookie cork into `iss:booth-riser` after a no-JS tape. */
export function SyncBoothRiser({ map }: { map: BoothRiserMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothRiserMaps(readBoothRiser(), map);
      window.localStorage.setItem(
        BOOTH_RISER_STORAGE_KEY,
        serializeBoothRiser(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
