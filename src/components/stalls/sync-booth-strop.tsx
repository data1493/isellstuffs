"use client";

import { useEffect } from "react";

import {
  BOOTH_STROP_STORAGE_KEY,
  mergeBoothStropMaps,
  readBoothStrop,
  serializeBoothStrop,
  type BoothStropMap,
} from "@/lib/booth-strop";

/** Copy the cookie cork into `iss:booth-strop` after a no-JS tape. */
export function SyncBoothStrop({ map }: { map: BoothStropMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothStropMaps(readBoothStrop(), map);
      window.localStorage.setItem(
        BOOTH_STROP_STORAGE_KEY,
        serializeBoothStrop(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
