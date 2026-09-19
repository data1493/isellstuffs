"use client";

import { useEffect } from "react";

import {
  BOOTH_FOIL_STORAGE_KEY,
  mergeBoothFoilMaps,
  readBoothFoil,
  serializeBoothFoil,
  type BoothFoilMap,
} from "@/lib/booth-foil";

/** Copy the cookie cork into `iss:booth-foil` after a no-JS tape. */
export function SyncBoothFoil({ map }: { map: BoothFoilMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothFoilMaps(readBoothFoil(), map);
      window.localStorage.setItem(
        BOOTH_FOIL_STORAGE_KEY,
        serializeBoothFoil(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
