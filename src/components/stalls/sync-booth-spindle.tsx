"use client";

import { useEffect } from "react";

import {
  BOOTH_SPINDLE_STORAGE_KEY,
  mergeBoothSpindleMaps,
  readBoothSpindle,
  serializeBoothSpindle,
  type BoothSpindleMap,
} from "@/lib/booth-spindle";

/** Copy the cookie cork into `iss:booth-spindle` after a no-JS tape. */
export function SyncBoothSpindle({ map }: { map: BoothSpindleMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothSpindleMaps(readBoothSpindle(), map);
      window.localStorage.setItem(
        BOOTH_SPINDLE_STORAGE_KEY,
        serializeBoothSpindle(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
