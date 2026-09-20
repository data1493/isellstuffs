"use client";

import { useEffect } from "react";

import {
  BOOTH_SNIPS_STORAGE_KEY,
  mergeBoothSnipsMaps,
  readBoothSnips,
  serializeBoothSnips,
  type BoothSnipsMap,
} from "@/lib/booth-snips";

/** Copy the cookie cork into `iss:booth-snips` after a no-JS tape. */
export function SyncBoothSnips({ map }: { map: BoothSnipsMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothSnipsMaps(readBoothSnips(), map);
      window.localStorage.setItem(
        BOOTH_SNIPS_STORAGE_KEY,
        serializeBoothSnips(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
