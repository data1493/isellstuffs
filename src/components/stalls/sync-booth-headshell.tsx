"use client";

import { useEffect } from "react";

import {
  BOOTH_HEADSHELL_STORAGE_KEY,
  mergeBoothHeadshellMaps,
  readBoothHeadshell,
  serializeBoothHeadshell,
  type BoothHeadshellMap,
} from "@/lib/booth-headshell";

/** Copy the cookie cork into `iss:booth-headshell` after a no-JS tape. */
export function SyncBoothHeadshell({ map }: { map: BoothHeadshellMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothHeadshellMaps(readBoothHeadshell(), map);
      window.localStorage.setItem(
        BOOTH_HEADSHELL_STORAGE_KEY,
        serializeBoothHeadshell(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
