"use client";

import { useEffect } from "react";

import {
  BOOTH_FLYWHEEL_STORAGE_KEY,
  mergeBoothFlywheelMaps,
  readBoothFlywheel,
  serializeBoothFlywheel,
  type BoothFlywheelMap,
} from "@/lib/booth-flywheel";

/** Copy the cookie cork into `iss:booth-flywheel` after a no-JS tape. */
export function SyncBoothFlywheel({ map }: { map: BoothFlywheelMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothFlywheelMaps(readBoothFlywheel(), map);
      window.localStorage.setItem(
        BOOTH_FLYWHEEL_STORAGE_KEY,
        serializeBoothFlywheel(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
