"use client";

import { useEffect } from "react";

import {
  BOOTH_FLASH_STORAGE_KEY,
  mergeBoothFlashMaps,
  readBoothFlash,
  serializeBoothFlash,
  type BoothFlashMap,
} from "@/lib/booth-flash";

/** Copy the cookie cork into `iss:booth-flash` after a no-JS tape. */
export function SyncBoothFlash({ map }: { map: BoothFlashMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothFlashMaps(readBoothFlash(), map);
      window.localStorage.setItem(
        BOOTH_FLASH_STORAGE_KEY,
        serializeBoothFlash(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
