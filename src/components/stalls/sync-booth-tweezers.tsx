"use client";

import { useEffect } from "react";

import {
  BOOTH_TWEEZERS_STORAGE_KEY,
  mergeBoothTweezersMaps,
  readBoothTweezers,
  serializeBoothTweezers,
  type BoothTweezersMap,
} from "@/lib/booth-tweezers";

/** Copy the cookie cork into `iss:booth-tweezers` after a no-JS tape. */
export function SyncBoothTweezers({ map }: { map: BoothTweezersMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothTweezersMaps(readBoothTweezers(), map);
      window.localStorage.setItem(
        BOOTH_TWEEZERS_STORAGE_KEY,
        serializeBoothTweezers(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
