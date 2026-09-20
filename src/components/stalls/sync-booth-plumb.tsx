"use client";

import { useEffect } from "react";

import {
  BOOTH_PLUMB_STORAGE_KEY,
  mergeBoothPlumbMaps,
  readBoothPlumb,
  serializeBoothPlumb,
  type BoothPlumbMap,
} from "@/lib/booth-plumb";

/** Copy the cookie cork into `iss:booth-plumb` after a no-JS tape. */
export function SyncBoothPlumb({ map }: { map: BoothPlumbMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothPlumbMaps(readBoothPlumb(), map);
      window.localStorage.setItem(
        BOOTH_PLUMB_STORAGE_KEY,
        serializeBoothPlumb(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
