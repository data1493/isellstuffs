"use client";

import { useEffect } from "react";

import {
  BOOTH_SHRINK_STORAGE_KEY,
  mergeBoothShrinkMaps,
  readBoothShrink,
  serializeBoothShrink,
  type BoothShrinkMap,
} from "@/lib/booth-shrink";

/** Copy the cookie cork into `iss:booth-shrink` after a no-JS tape. */
export function SyncBoothShrink({ map }: { map: BoothShrinkMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothShrinkMaps(readBoothShrink(), map);
      window.localStorage.setItem(
        BOOTH_SHRINK_STORAGE_KEY,
        serializeBoothShrink(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
