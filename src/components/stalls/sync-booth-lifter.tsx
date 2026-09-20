"use client";

import { useEffect } from "react";

import {
  BOOTH_LIFTER_STORAGE_KEY,
  mergeBoothLifterMaps,
  readBoothLifter,
  serializeBoothLifter,
  type BoothLifterMap,
} from "@/lib/booth-lifter";

/** Copy the cookie cork into `iss:booth-lifter` after a no-JS tape. */
export function SyncBoothLifter({ map }: { map: BoothLifterMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothLifterMaps(readBoothLifter(), map);
      window.localStorage.setItem(
        BOOTH_LIFTER_STORAGE_KEY,
        serializeBoothLifter(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
