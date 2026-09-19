"use client";

import { useEffect } from "react";

import {
  BOOTH_LAST_STORAGE_KEY,
  mergeBoothLastMaps,
  readBoothLast,
  serializeBoothLast,
  type BoothLastMap,
} from "@/lib/booth-last";

/** Copy the cookie cork into `iss:booth-last` after a no-JS tape. */
export function SyncBoothLast({ map }: { map: BoothLastMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothLastMaps(readBoothLast(), map);
      window.localStorage.setItem(
        BOOTH_LAST_STORAGE_KEY,
        serializeBoothLast(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
