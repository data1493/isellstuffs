"use client";

import { useEffect } from "react";

import {
  BOOTH_THIMBLE_STORAGE_KEY,
  mergeBoothThimbleMaps,
  readBoothThimble,
  serializeBoothThimble,
  type BoothThimbleMap,
} from "@/lib/booth-thimble";

/** Copy the cookie cork into `iss:booth-thimble` after a no-JS tape. */
export function SyncBoothThimble({ map }: { map: BoothThimbleMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothThimbleMaps(readBoothThimble(), map);
      window.localStorage.setItem(
        BOOTH_THIMBLE_STORAGE_KEY,
        serializeBoothThimble(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
