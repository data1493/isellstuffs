"use client";

import { useEffect } from "react";

import {
  BOOTH_TORPEDO_STORAGE_KEY,
  mergeBoothTorpedoMaps,
  readBoothTorpedo,
  serializeBoothTorpedo,
  type BoothTorpedoMap,
} from "@/lib/booth-torpedo";

/** Copy the cookie cork into `iss:booth-torpedo` after a no-JS tape. */
export function SyncBoothTorpedo({ map }: { map: BoothTorpedoMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothTorpedoMaps(readBoothTorpedo(), map);
      window.localStorage.setItem(
        BOOTH_TORPEDO_STORAGE_KEY,
        serializeBoothTorpedo(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
