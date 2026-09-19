"use client";

import { useEffect } from "react";

import {
  BOOTH_STAY_STORAGE_KEY,
  mergeBoothStayMaps,
  readBoothStay,
  serializeBoothStay,
  type BoothStayMap,
} from "@/lib/booth-stay";

/** Copy the cookie cork into `iss:booth-stay` after a no-JS tape. */
export function SyncBoothStay({ map }: { map: BoothStayMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothStayMaps(readBoothStay(), map);
      window.localStorage.setItem(
        BOOTH_STAY_STORAGE_KEY,
        serializeBoothStay(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
