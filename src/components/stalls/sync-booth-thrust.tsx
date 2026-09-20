"use client";

import { useEffect } from "react";

import {
  BOOTH_THRUST_STORAGE_KEY,
  mergeBoothThrustMaps,
  readBoothThrust,
  serializeBoothThrust,
  type BoothThrustMap,
} from "@/lib/booth-thrust";

/** Copy the cookie cork into `iss:booth-thrust` after a no-JS tape. */
export function SyncBoothThrust({ map }: { map: BoothThrustMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothThrustMaps(readBoothThrust(), map);
      window.localStorage.setItem(
        BOOTH_THRUST_STORAGE_KEY,
        serializeBoothThrust(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
