"use client";

import { useEffect } from "react";

import {
  BOOTH_MALLET_STORAGE_KEY,
  mergeBoothMalletMaps,
  readBoothMallet,
  serializeBoothMallet,
  type BoothMalletMap,
} from "@/lib/booth-mallet";

/** Copy the cookie cork into `iss:booth-mallet` after a no-JS tape. */
export function SyncBoothMallet({ map }: { map: BoothMalletMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothMalletMaps(readBoothMallet(), map);
      window.localStorage.setItem(
        BOOTH_MALLET_STORAGE_KEY,
        serializeBoothMallet(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
