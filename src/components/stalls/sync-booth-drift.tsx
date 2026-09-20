"use client";

import { useEffect } from "react";

import {
  BOOTH_DRIFT_STORAGE_KEY,
  mergeBoothDriftMaps,
  readBoothDrift,
  serializeBoothDrift,
  type BoothDriftMap,
} from "@/lib/booth-drift";

/** Copy the cookie cork into `iss:booth-drift` after a no-JS tape. */
export function SyncBoothDrift({ map }: { map: BoothDriftMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothDriftMaps(readBoothDrift(), map);
      window.localStorage.setItem(
        BOOTH_DRIFT_STORAGE_KEY,
        serializeBoothDrift(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
