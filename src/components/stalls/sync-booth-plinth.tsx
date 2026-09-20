"use client";

import { useEffect } from "react";

import {
  BOOTH_PLINTH_STORAGE_KEY,
  mergeBoothPlinthMaps,
  readBoothPlinth,
  serializeBoothPlinth,
  type BoothPlinthMap,
} from "@/lib/booth-plinth";

/** Copy the cookie cork into `iss:booth-plinth` after a no-JS tape. */
export function SyncBoothPlinth({ map }: { map: BoothPlinthMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothPlinthMaps(readBoothPlinth(), map);
      window.localStorage.setItem(
        BOOTH_PLINTH_STORAGE_KEY,
        serializeBoothPlinth(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
