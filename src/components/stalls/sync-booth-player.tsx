"use client";

import { useEffect } from "react";

import {
  BOOTH_PLAYER_STORAGE_KEY,
  mergeBoothPlayerMaps,
  readBoothPlayer,
  serializeBoothPlayer,
  type BoothPlayerMap,
} from "@/lib/booth-player";

/** Copy the cookie cork into `iss:booth-player` after a no-JS tape. */
export function SyncBoothPlayer({ map }: { map: BoothPlayerMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothPlayerMaps(readBoothPlayer(), map);
      window.localStorage.setItem(
        BOOTH_PLAYER_STORAGE_KEY,
        serializeBoothPlayer(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
