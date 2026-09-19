"use client";

import { useEffect } from "react";

import {
  BOOTH_DIG_STORAGE_KEY,
  mergeBoothDigMaps,
  readBoothDig,
  serializeBoothDig,
  type BoothDigMap,
} from "@/lib/booth-dig";

/** Copy the cookie cork into `iss:booth-dig` after a no-JS tape. */
export function SyncBoothDig({ map }: { map: BoothDigMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothDigMaps(readBoothDig(), map);
      window.localStorage.setItem(
        BOOTH_DIG_STORAGE_KEY,
        serializeBoothDig(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
