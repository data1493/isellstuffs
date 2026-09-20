"use client";

import { useEffect } from "react";

import {
  BOOTH_VARIAC_STORAGE_KEY,
  mergeBoothVariacMaps,
  readBoothVariac,
  serializeBoothVariac,
  type BoothVariacMap,
} from "@/lib/booth-variac";

/** Copy the cookie cork into `iss:booth-variac` after a no-JS tape. */
export function SyncBoothVariac({ map }: { map: BoothVariacMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothVariacMaps(readBoothVariac(), map);
      window.localStorage.setItem(
        BOOTH_VARIAC_STORAGE_KEY,
        serializeBoothVariac(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
