"use client";

import { useEffect } from "react";

import {
  BOOTH_BURN_STORAGE_KEY,
  mergeBoothBurnMaps,
  readBoothBurn,
  serializeBoothBurn,
  type BoothBurnMap,
} from "@/lib/booth-burn";

/** Copy the cookie cork into `iss:booth-burn` after a no-JS tape. */
export function SyncBoothBurn({ map }: { map: BoothBurnMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothBurnMaps(readBoothBurn(), map);
      window.localStorage.setItem(
        BOOTH_BURN_STORAGE_KEY,
        serializeBoothBurn(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
