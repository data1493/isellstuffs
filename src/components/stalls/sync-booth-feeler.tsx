"use client";

import { useEffect } from "react";

import {
  BOOTH_FEELER_STORAGE_KEY,
  mergeBoothFeelerMaps,
  readBoothFeeler,
  serializeBoothFeeler,
  type BoothFeelerMap,
} from "@/lib/booth-feeler";

/** Copy the cookie cork into `iss:booth-feeler` after a no-JS tape. */
export function SyncBoothFeeler({ map }: { map: BoothFeelerMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothFeelerMaps(readBoothFeeler(), map);
      window.localStorage.setItem(
        BOOTH_FEELER_STORAGE_KEY,
        serializeBoothFeeler(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
