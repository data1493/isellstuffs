"use client";

import { useEffect } from "react";

import {
  BOOTH_COPY_STORAGE_KEY,
  mergeBoothCopyMaps,
  readBoothCopy,
  serializeBoothCopy,
  type BoothCopyMap,
} from "@/lib/booth-copy";

/** Copy the cookie cork into `iss:booth-copy` after a no-JS tape. */
export function SyncBoothCopy({ map }: { map: BoothCopyMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothCopyMaps(readBoothCopy(), map);
      window.localStorage.setItem(
        BOOTH_COPY_STORAGE_KEY,
        serializeBoothCopy(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
