"use client";

import { useEffect } from "react";

import {
  BOOTH_SEAT_STORAGE_KEY,
  mergeBoothSeatMaps,
  readBoothSeat,
  serializeBoothSeat,
  type BoothSeatMap,
} from "@/lib/booth-seat";

/** Copy the cookie cork into `iss:booth-seat` after a no-JS tape. */
export function SyncBoothSeat({ map }: { map: BoothSeatMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothSeatMaps(readBoothSeat(), map);
      window.localStorage.setItem(
        BOOTH_SEAT_STORAGE_KEY,
        serializeBoothSeat(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
