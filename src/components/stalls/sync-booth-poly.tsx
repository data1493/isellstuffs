"use client";

import { useEffect } from "react";

import {
  BOOTH_POLY_STORAGE_KEY,
  mergeBoothPolyMaps,
  readBoothPoly,
  serializeBoothPoly,
  type BoothPolyMap,
} from "@/lib/booth-poly";

/** Copy the cookie cork into `iss:booth-poly` after a no-JS tape. */
export function SyncBoothPoly({ map }: { map: BoothPolyMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothPolyMaps(readBoothPoly(), map);
      window.localStorage.setItem(
        BOOTH_POLY_STORAGE_KEY,
        serializeBoothPoly(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
