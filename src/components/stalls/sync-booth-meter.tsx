"use client";

import { useEffect } from "react";

import {
  BOOTH_METER_STORAGE_KEY,
  mergeBoothMeterMaps,
  readBoothMeter,
  serializeBoothMeter,
  type BoothMeterMap,
} from "@/lib/booth-meter";

/** Copy the cookie cork into `iss:booth-meter` after a no-JS tape. */
export function SyncBoothMeter({ map }: { map: BoothMeterMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothMeterMaps(readBoothMeter(), map);
      window.localStorage.setItem(
        BOOTH_METER_STORAGE_KEY,
        serializeBoothMeter(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
