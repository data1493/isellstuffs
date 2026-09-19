"use client";

import { useEffect } from "react";

import {
  BOOTH_FUNNEL_STORAGE_KEY,
  mergeBoothFunnelMaps,
  readBoothFunnel,
  serializeBoothFunnel,
  type BoothFunnelMap,
} from "@/lib/booth-funnel";

/** Copy the cookie cork into `iss:booth-funnel` after a no-JS tape. */
export function SyncBoothFunnel({ map }: { map: BoothFunnelMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothFunnelMaps(readBoothFunnel(), map);
      window.localStorage.setItem(
        BOOTH_FUNNEL_STORAGE_KEY,
        serializeBoothFunnel(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
