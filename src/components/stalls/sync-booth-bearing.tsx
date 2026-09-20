"use client";

import { useEffect } from "react";

import {
  BOOTH_BEARING_STORAGE_KEY,
  mergeBoothBearingMaps,
  readBoothBearing,
  serializeBoothBearing,
  type BoothBearingMap,
} from "@/lib/booth-bearing";

/** Copy the cookie cork into `iss:booth-bearing` after a no-JS tape. */
export function SyncBoothBearing({ map }: { map: BoothBearingMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothBearingMaps(readBoothBearing(), map);
      window.localStorage.setItem(
        BOOTH_BEARING_STORAGE_KEY,
        serializeBoothBearing(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
