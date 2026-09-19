"use client";

import { useEffect } from "react";

import {
  BOOTH_WIFI_STORAGE_KEY,
  mergeBoothWifiMaps,
  readBoothWifi,
  serializeBoothWifi,
  type BoothWifiMap,
} from "@/lib/booth-wifi";

/** Copy the cookie cork into `iss:booth-wifi` after a no-JS tape. */
export function SyncBoothWifi({ map }: { map: BoothWifiMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothWifiMaps(readBoothWifi(), map);
      window.localStorage.setItem(
        BOOTH_WIFI_STORAGE_KEY,
        serializeBoothWifi(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
