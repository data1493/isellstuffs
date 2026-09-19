"use client";

import { useEffect } from "react";

import {
  BOOTH_COVER_STORAGE_KEY,
  mergeBoothCoverMaps,
  readBoothCover,
  serializeBoothCover,
  type BoothCoverMap,
} from "@/lib/booth-cover";

/** Copy the cookie cork into `iss:booth-cover` after a no-JS tape. */
export function SyncBoothCover({ map }: { map: BoothCoverMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothCoverMaps(readBoothCover(), map);
      window.localStorage.setItem(
        BOOTH_COVER_STORAGE_KEY,
        serializeBoothCover(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
