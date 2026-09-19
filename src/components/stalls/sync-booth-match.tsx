"use client";

import { useEffect } from "react";

import {
  BOOTH_MATCH_STORAGE_KEY,
  mergeBoothMatchMaps,
  readBoothMatch,
  serializeBoothMatch,
  type BoothMatchMap,
} from "@/lib/booth-match";

/** Copy the cookie cork into `iss:booth-match` after a no-JS tape. */
export function SyncBoothMatch({ map }: { map: BoothMatchMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothMatchMaps(readBoothMatch(), map);
      window.localStorage.setItem(
        BOOTH_MATCH_STORAGE_KEY,
        serializeBoothMatch(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
