"use client";

import { useEffect } from "react";

import {
  BOOTH_REFLEX_STORAGE_KEY,
  mergeBoothReflexMaps,
  readBoothReflex,
  serializeBoothReflex,
  type BoothReflexMap,
} from "@/lib/booth-reflex";

/** Copy the cookie cork into `iss:booth-reflex` after a no-JS tape. */
export function SyncBoothReflex({ map }: { map: BoothReflexMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothReflexMaps(readBoothReflex(), map);
      window.localStorage.setItem(
        BOOTH_REFLEX_STORAGE_KEY,
        serializeBoothReflex(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
