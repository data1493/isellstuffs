"use client";

import { useEffect } from "react";

import {
  BOOTH_STATOR_STORAGE_KEY,
  mergeBoothStatorMaps,
  readBoothStator,
  serializeBoothStator,
  type BoothStatorMap,
} from "@/lib/booth-stator";

/** Copy the cookie cork into `iss:booth-stator` after a no-JS tape. */
export function SyncBoothStator({ map }: { map: BoothStatorMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothStatorMaps(readBoothStator(), map);
      window.localStorage.setItem(
        BOOTH_STATOR_STORAGE_KEY,
        serializeBoothStator(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
