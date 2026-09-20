"use client";

import { useEffect } from "react";

import {
  BOOTH_CRADLE_STORAGE_KEY,
  mergeBoothCradleMaps,
  readBoothCradle,
  serializeBoothCradle,
  type BoothCradleMap,
} from "@/lib/booth-cradle";

/** Copy the cookie cork into `iss:booth-cradle` after a no-JS tape. */
export function SyncBoothCradle({ map }: { map: BoothCradleMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothCradleMaps(readBoothCradle(), map);
      window.localStorage.setItem(
        BOOTH_CRADLE_STORAGE_KEY,
        serializeBoothCradle(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
