"use client";

import { useEffect } from "react";

import {
  BOOTH_SLIPMAT_STORAGE_KEY,
  mergeBoothSlipmatMaps,
  readBoothSlipmat,
  serializeBoothSlipmat,
  type BoothSlipmatMap,
} from "@/lib/booth-slipmat";

/** Copy the cookie cork into `iss:booth-slipmat` after a no-JS tape. */
export function SyncBoothSlipmat({ map }: { map: BoothSlipmatMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothSlipmatMaps(readBoothSlipmat(), map);
      window.localStorage.setItem(
        BOOTH_SLIPMAT_STORAGE_KEY,
        serializeBoothSlipmat(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
