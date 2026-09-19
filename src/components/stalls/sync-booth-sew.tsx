"use client";

import { useEffect } from "react";

import {
  BOOTH_SEW_STORAGE_KEY,
  mergeBoothSewMaps,
  readBoothSew,
  serializeBoothSew,
  type BoothSewMap,
} from "@/lib/booth-sew";

/** Copy the cookie cork into `iss:booth-sew` after a no-JS tape. */
export function SyncBoothSew({ map }: { map: BoothSewMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothSewMaps(readBoothSew(), map);
      window.localStorage.setItem(
        BOOTH_SEW_STORAGE_KEY,
        serializeBoothSew(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
