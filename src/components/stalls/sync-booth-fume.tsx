"use client";

import { useEffect } from "react";

import {
  BOOTH_FUME_STORAGE_KEY,
  mergeBoothFumeMaps,
  readBoothFume,
  serializeBoothFume,
  type BoothFumeMap,
} from "@/lib/booth-fume";

/** Copy the cookie cork into `iss:booth-fume` after a no-JS tape. */
export function SyncBoothFume({ map }: { map: BoothFumeMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothFumeMaps(readBoothFume(), map);
      window.localStorage.setItem(
        BOOTH_FUME_STORAGE_KEY,
        serializeBoothFume(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
