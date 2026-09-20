"use client";

import { useEffect } from "react";

import {
  BOOTH_GOBO_STORAGE_KEY,
  mergeBoothGoboMaps,
  readBoothGobo,
  serializeBoothGobo,
  type BoothGoboMap,
} from "@/lib/booth-gobo";

/** Copy the cookie cork into `iss:booth-gobo` after a no-JS tape. */
export function SyncBoothGobo({ map }: { map: BoothGoboMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothGoboMaps(readBoothGobo(), map);
      window.localStorage.setItem(
        BOOTH_GOBO_STORAGE_KEY,
        serializeBoothGobo(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
