"use client";

import { useEffect } from "react";

import {
  MOVED_SPOT_STORAGE_KEY,
  mergeMovedSpotMaps,
  readMovedSpot,
  serializeMovedSpot,
  type MovedSpotMap,
} from "@/lib/moved-spot";

/** Copy the cookie cork into `iss:moved-spot` after a no-JS tape. */
export function SyncMovedSpot({ map }: { map: MovedSpotMap }) {
  useEffect(() => {
    try {
      const next = mergeMovedSpotMaps(readMovedSpot(), map);
      window.localStorage.setItem(
        MOVED_SPOT_STORAGE_KEY,
        serializeMovedSpot(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
