"use client";

import { useEffect } from "react";

import {
  BOOTH_PREHEATER_STORAGE_KEY,
  mergeBoothPreheaterMaps,
  readBoothPreheater,
  serializeBoothPreheater,
  type BoothPreheaterMap,
} from "@/lib/booth-preheater";

/** Copy the cookie cork into `iss:booth-preheater` after a no-JS tape. */
export function SyncBoothPreheater({ map }: { map: BoothPreheaterMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothPreheaterMaps(readBoothPreheater(), map);
      window.localStorage.setItem(
        BOOTH_PREHEATER_STORAGE_KEY,
        serializeBoothPreheater(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
