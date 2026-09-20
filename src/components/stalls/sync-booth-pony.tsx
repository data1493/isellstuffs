"use client";

import { useEffect } from "react";

import {
  BOOTH_PONY_STORAGE_KEY,
  mergeBoothPonyMaps,
  readBoothPony,
  serializeBoothPony,
  type BoothPonyMap,
} from "@/lib/booth-pony";

/** Copy the cookie cork into `iss:booth-pony` after a no-JS tape. */
export function SyncBoothPony({ map }: { map: BoothPonyMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothPonyMaps(readBoothPony(), map);
      window.localStorage.setItem(
        BOOTH_PONY_STORAGE_KEY,
        serializeBoothPony(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
