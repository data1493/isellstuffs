"use client";

import { useEffect } from "react";

import {
  BOOTH_DRIVER_STORAGE_KEY,
  mergeBoothDriverMaps,
  readBoothDriver,
  serializeBoothDriver,
  type BoothDriverMap,
} from "@/lib/booth-driver";

/** Copy the cookie cork into `iss:booth-driver` after a no-JS tape. */
export function SyncBoothDriver({ map }: { map: BoothDriverMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothDriverMaps(readBoothDriver(), map);
      window.localStorage.setItem(
        BOOTH_DRIVER_STORAGE_KEY,
        serializeBoothDriver(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
