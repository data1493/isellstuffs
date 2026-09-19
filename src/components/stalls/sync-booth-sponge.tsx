"use client";

import { useEffect } from "react";

import {
  BOOTH_SPONGE_STORAGE_KEY,
  mergeBoothSpongeMaps,
  readBoothSponge,
  serializeBoothSponge,
  type BoothSpongeMap,
} from "@/lib/booth-sponge";

/** Copy the cookie cork into `iss:booth-sponge` after a no-JS tape. */
export function SyncBoothSponge({ map }: { map: BoothSpongeMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothSpongeMaps(readBoothSponge(), map);
      window.localStorage.setItem(
        BOOTH_SPONGE_STORAGE_KEY,
        serializeBoothSponge(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
