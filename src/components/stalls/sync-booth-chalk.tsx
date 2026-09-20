"use client";

import { useEffect } from "react";

import {
  BOOTH_CHALK_STORAGE_KEY,
  mergeBoothChalkMaps,
  readBoothChalk,
  serializeBoothChalk,
  type BoothChalkMap,
} from "@/lib/booth-chalk";

/** Copy the cookie cork into `iss:booth-chalk` after a no-JS tape. */
export function SyncBoothChalk({ map }: { map: BoothChalkMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothChalkMaps(readBoothChalk(), map);
      window.localStorage.setItem(
        BOOTH_CHALK_STORAGE_KEY,
        serializeBoothChalk(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
