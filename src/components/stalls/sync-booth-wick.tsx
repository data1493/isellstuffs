"use client";

import { useEffect } from "react";

import {
  BOOTH_WICK_STORAGE_KEY,
  mergeBoothWickMaps,
  readBoothWick,
  serializeBoothWick,
  type BoothWickMap,
} from "@/lib/booth-wick";

/** Copy the cookie cork into `iss:booth-wick` after a no-JS tape. */
export function SyncBoothWick({ map }: { map: BoothWickMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothWickMaps(readBoothWick(), map);
      window.localStorage.setItem(BOOTH_WICK_STORAGE_KEY, serializeBoothWick(next));
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
