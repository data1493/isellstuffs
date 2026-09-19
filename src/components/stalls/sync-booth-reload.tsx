"use client";

import { useEffect } from "react";

import {
  BOOTH_RELOAD_STORAGE_KEY,
  mergeBoothReloadMaps,
  readBoothReload,
  serializeBoothReload,
  type BoothReloadMap,
} from "@/lib/booth-reload";

/** Copy the cookie cork into `iss:booth-reload` after a no-JS tape. */
export function SyncBoothReload({ map }: { map: BoothReloadMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothReloadMaps(readBoothReload(), map);
      window.localStorage.setItem(
        BOOTH_RELOAD_STORAGE_KEY,
        serializeBoothReload(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
