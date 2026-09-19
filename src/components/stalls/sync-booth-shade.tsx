"use client";

import { useEffect } from "react";

import {
  BOOTH_SHADE_STORAGE_KEY,
  mergeBoothShadeMaps,
  readBoothShade,
  serializeBoothShade,
  type BoothShadeMap,
} from "@/lib/booth-shade";

/** Copy the cookie cork into `iss:booth-shade` after a no-JS tape. */
export function SyncBoothShade({ map }: { map: BoothShadeMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothShadeMaps(readBoothShade(), map);
      window.localStorage.setItem(
        BOOTH_SHADE_STORAGE_KEY,
        serializeBoothShade(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
