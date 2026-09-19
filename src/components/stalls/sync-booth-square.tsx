"use client";

import { useEffect } from "react";

import {
  BOOTH_SQUARE_STORAGE_KEY,
  mergeBoothSquareMaps,
  readBoothSquare,
  serializeBoothSquare,
  type BoothSquareMap,
} from "@/lib/booth-square";

/** Copy the cookie cork into `iss:booth-square` after a no-JS tape. */
export function SyncBoothSquare({ map }: { map: BoothSquareMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothSquareMaps(readBoothSquare(), map);
      window.localStorage.setItem(
        BOOTH_SQUARE_STORAGE_KEY,
        serializeBoothSquare(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
