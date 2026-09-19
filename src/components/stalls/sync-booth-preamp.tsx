"use client";

import { useEffect } from "react";

import {
  BOOTH_PREAMP_STORAGE_KEY,
  mergeBoothPreampMaps,
  readBoothPreamp,
  serializeBoothPreamp,
  type BoothPreampMap,
} from "@/lib/booth-preamp";

/** Copy the cookie cork into `iss:booth-preamp` after a no-JS tape. */
export function SyncBoothPreamp({ map }: { map: BoothPreampMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothPreampMaps(readBoothPreamp(), map);
      window.localStorage.setItem(
        BOOTH_PREAMP_STORAGE_KEY,
        serializeBoothPreamp(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
