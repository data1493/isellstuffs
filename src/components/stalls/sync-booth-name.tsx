"use client";

import { useEffect } from "react";

import {
  BOOTH_NAME_STORAGE_KEY,
  mergeBoothNameMaps,
  readBoothName,
  serializeBoothName,
  type BoothNameMap,
} from "@/lib/booth-name";

/** Copy the cookie cork into `iss:booth-name` after a no-JS tape. */
export function SyncBoothName({ map }: { map: BoothNameMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothNameMaps(readBoothName(), map);
      window.localStorage.setItem(
        BOOTH_NAME_STORAGE_KEY,
        serializeBoothName(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
