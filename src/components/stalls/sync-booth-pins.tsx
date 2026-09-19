"use client";

import { useEffect } from "react";

import {
  BOOTH_PINS_STORAGE_KEY,
  mergeBoothPinsMaps,
  readBoothPins,
  serializeBoothPins,
  type BoothPinsMap,
} from "@/lib/booth-pins";

/** Copy the cookie cork into `iss:booth-pins` after a no-JS tape. */
export function SyncBoothPins({ map }: { map: BoothPinsMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothPinsMaps(readBoothPins(), map);
      window.localStorage.setItem(
        BOOTH_PINS_STORAGE_KEY,
        serializeBoothPins(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
