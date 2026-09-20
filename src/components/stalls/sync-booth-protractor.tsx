"use client";

import { useEffect } from "react";

import {
  BOOTH_PROTRACTOR_STORAGE_KEY,
  mergeBoothProtractorMaps,
  readBoothProtractor,
  serializeBoothProtractor,
  type BoothProtractorMap,
} from "@/lib/booth-protractor";

/** Copy the cookie cork into `iss:booth-protractor` after a no-JS tape. */
export function SyncBoothProtractor({ map }: { map: BoothProtractorMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothProtractorMaps(readBoothProtractor(), map);
      window.localStorage.setItem(
        BOOTH_PROTRACTOR_STORAGE_KEY,
        serializeBoothProtractor(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
