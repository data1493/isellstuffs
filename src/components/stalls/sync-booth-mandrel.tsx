"use client";

import { useEffect } from "react";

import {
  BOOTH_MANDREL_STORAGE_KEY,
  mergeBoothMandrelMaps,
  readBoothMandrel,
  serializeBoothMandrel,
  type BoothMandrelMap,
} from "@/lib/booth-mandrel";

/** Copy the cookie cork into `iss:booth-mandrel` after a no-JS tape. */
export function SyncBoothMandrel({ map }: { map: BoothMandrelMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothMandrelMaps(readBoothMandrel(), map);
      window.localStorage.setItem(
        BOOTH_MANDREL_STORAGE_KEY,
        serializeBoothMandrel(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
