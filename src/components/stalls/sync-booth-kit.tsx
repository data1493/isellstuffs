"use client";

import { useEffect } from "react";

import {
  BOOTH_KIT_STORAGE_KEY,
  mergeBoothKitMaps,
  readBoothKit,
  serializeBoothKit,
  type BoothKitMap,
} from "@/lib/booth-kit";

/** Copy the cookie cork into `iss:booth-kit` after a no-JS tape. */
export function SyncBoothKit({ map }: { map: BoothKitMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothKitMaps(readBoothKit(), map);
      window.localStorage.setItem(
        BOOTH_KIT_STORAGE_KEY,
        serializeBoothKit(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
