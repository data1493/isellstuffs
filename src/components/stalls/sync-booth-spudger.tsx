"use client";

import { useEffect } from "react";

import {
  BOOTH_SPUDGER_STORAGE_KEY,
  mergeBoothSpudgerMaps,
  readBoothSpudger,
  serializeBoothSpudger,
  type BoothSpudgerMap,
} from "@/lib/booth-spudger";

/** Copy the cookie cork into `iss:booth-spudger` after a no-JS tape. */
export function SyncBoothSpudger({ map }: { map: BoothSpudgerMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothSpudgerMaps(readBoothSpudger(), map);
      window.localStorage.setItem(
        BOOTH_SPUDGER_STORAGE_KEY,
        serializeBoothSpudger(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
