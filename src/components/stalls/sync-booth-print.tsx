"use client";

import { useEffect } from "react";

import {
  BOOTH_PRINT_STORAGE_KEY,
  mergeBoothPrintMaps,
  readBoothPrint,
  serializeBoothPrint,
  type BoothPrintMap,
} from "@/lib/booth-print";

/** Copy the cookie cork into `iss:booth-print` after a no-JS tape. */
export function SyncBoothPrint({ map }: { map: BoothPrintMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothPrintMaps(readBoothPrint(), map);
      window.localStorage.setItem(
        BOOTH_PRINT_STORAGE_KEY,
        serializeBoothPrint(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
