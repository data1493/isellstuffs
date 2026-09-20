"use client";

import { useEffect } from "react";

import {
  BOOTH_RACE_STORAGE_KEY,
  mergeBoothRaceMaps,
  readBoothRace,
  serializeBoothRace,
  type BoothRaceMap,
} from "@/lib/booth-race";

/** Copy the cookie cork into `iss:booth-race` after a no-JS tape. */
export function SyncBoothRace({ map }: { map: BoothRaceMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothRaceMaps(readBoothRace(), map);
      window.localStorage.setItem(
        BOOTH_RACE_STORAGE_KEY,
        serializeBoothRace(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
