"use client";

import { useEffect } from "react";

import {
  BOOTH_RICER_STORAGE_KEY,
  mergeBoothRicerMaps,
  readBoothRicer,
  serializeBoothRicer,
  type BoothRicerMap,
} from "@/lib/booth-ricer";

/** Copy the cookie cork into `iss:booth-ricer` after a no-JS tape. */
export function SyncBoothRicer({ map }: { map: BoothRicerMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothRicerMaps(readBoothRicer(), map);
      window.localStorage.setItem(
        BOOTH_RICER_STORAGE_KEY,
        serializeBoothRicer(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
