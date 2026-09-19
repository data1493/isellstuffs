"use client";

import { useEffect } from "react";

import {
  BOOTH_POUR_STORAGE_KEY,
  mergeBoothPourMaps,
  readBoothPour,
  serializeBoothPour,
  type BoothPourMap,
} from "@/lib/booth-pour";

/** Copy the cookie cork into `iss:booth-pour` after a no-JS tape. */
export function SyncBoothPour({ map }: { map: BoothPourMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothPourMaps(readBoothPour(), map);
      window.localStorage.setItem(
        BOOTH_POUR_STORAGE_KEY,
        serializeBoothPour(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
