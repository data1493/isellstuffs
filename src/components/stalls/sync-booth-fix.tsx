"use client";

import { useEffect } from "react";

import {
  BOOTH_FIX_STORAGE_KEY,
  mergeBoothFixMaps,
  readBoothFix,
  serializeBoothFix,
  type BoothFixMap,
} from "@/lib/booth-fix";

/** Copy the cookie cork into `iss:booth-fix` after a no-JS tape. */
export function SyncBoothFix({ map }: { map: BoothFixMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothFixMaps(readBoothFix(), map);
      window.localStorage.setItem(
        BOOTH_FIX_STORAGE_KEY,
        serializeBoothFix(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
