"use client";

import { useEffect } from "react";

import {
  BOOTH_CLAMP_STORAGE_KEY,
  mergeBoothClampMaps,
  readBoothClamp,
  serializeBoothClamp,
  type BoothClampMap,
} from "@/lib/booth-clamp";

/** Copy the cookie cork into `iss:booth-clamp` after a no-JS tape. */
export function SyncBoothClamp({ map }: { map: BoothClampMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothClampMaps(readBoothClamp(), map);
      window.localStorage.setItem(
        BOOTH_CLAMP_STORAGE_KEY,
        serializeBoothClamp(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
