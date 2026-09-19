"use client";

import { useEffect } from "react";

import {
  BOOTH_TRIVET_STORAGE_KEY,
  mergeBoothTrivetMaps,
  readBoothTrivet,
  serializeBoothTrivet,
  type BoothTrivetMap,
} from "@/lib/booth-trivet";

/** Copy the cookie cork into `iss:booth-trivet` after a no-JS tape. */
export function SyncBoothTrivet({ map }: { map: BoothTrivetMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothTrivetMaps(readBoothTrivet(), map);
      window.localStorage.setItem(
        BOOTH_TRIVET_STORAGE_KEY,
        serializeBoothTrivet(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
