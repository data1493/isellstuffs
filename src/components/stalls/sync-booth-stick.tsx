"use client";

import { useEffect } from "react";

import {
  BOOTH_STICK_STORAGE_KEY,
  mergeBoothStickMaps,
  readBoothStick,
  serializeBoothStick,
  type BoothStickMap,
} from "@/lib/booth-stick";

/** Copy the cookie cork into `iss:booth-stick` after a no-JS tape. */
export function SyncBoothStick({ map }: { map: BoothStickMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothStickMaps(readBoothStick(), map);
      window.localStorage.setItem(
        BOOTH_STICK_STORAGE_KEY,
        serializeBoothStick(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
