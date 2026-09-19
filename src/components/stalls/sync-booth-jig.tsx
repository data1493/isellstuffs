"use client";

import { useEffect } from "react";

import {
  BOOTH_JIG_STORAGE_KEY,
  mergeBoothJigMaps,
  readBoothJig,
  serializeBoothJig,
  type BoothJigMap,
} from "@/lib/booth-jig";

/** Copy the cookie cork into `iss:booth-jig` after a no-JS tape. */
export function SyncBoothJig({ map }: { map: BoothJigMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothJigMaps(readBoothJig(), map);
      window.localStorage.setItem(BOOTH_JIG_STORAGE_KEY, serializeBoothJig(next));
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
