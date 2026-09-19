"use client";

import { useEffect } from "react";

import {
  BOOTH_HARP_STORAGE_KEY,
  mergeBoothHarpMaps,
  readBoothHarp,
  serializeBoothHarp,
  type BoothHarpMap,
} from "@/lib/booth-harp";

/** Copy the cookie cork into `iss:booth-harp` after a no-JS tape. */
export function SyncBoothHarp({ map }: { map: BoothHarpMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothHarpMaps(readBoothHarp(), map);
      window.localStorage.setItem(
        BOOTH_HARP_STORAGE_KEY,
        serializeBoothHarp(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
