"use client";

import { useEffect } from "react";

import {
  BOOTH_EDDY_STORAGE_KEY,
  mergeBoothEddyMaps,
  readBoothEddy,
  serializeBoothEddy,
  type BoothEddyMap,
} from "@/lib/booth-eddy";

/** Copy the cookie cork into `iss:booth-eddy` after a no-JS tape. */
export function SyncBoothEddy({ map }: { map: BoothEddyMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothEddyMaps(readBoothEddy(), map);
      window.localStorage.setItem(BOOTH_EDDY_STORAGE_KEY, serializeBoothEddy(next));
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
