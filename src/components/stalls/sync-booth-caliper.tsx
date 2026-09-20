"use client";

import { useEffect } from "react";

import {
  BOOTH_CALIPER_STORAGE_KEY,
  mergeBoothCaliperMaps,
  readBoothCaliper,
  serializeBoothCaliper,
  type BoothCaliperMap,
} from "@/lib/booth-caliper";

/** Copy the cookie cork into `iss:booth-caliper` after a no-JS tape. */
export function SyncBoothCaliper({ map }: { map: BoothCaliperMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothCaliperMaps(readBoothCaliper(), map);
      window.localStorage.setItem(
        BOOTH_CALIPER_STORAGE_KEY,
        serializeBoothCaliper(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
