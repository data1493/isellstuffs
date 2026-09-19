"use client";

import { useEffect } from "react";

import {
  BOOTH_INNERS_STORAGE_KEY,
  mergeBoothInnersMaps,
  readBoothInners,
  serializeBoothInners,
  type BoothInnersMap,
} from "@/lib/booth-inners";

/** Copy the cookie cork into `iss:booth-inners` after a no-JS tape. */
export function SyncBoothInners({ map }: { map: BoothInnersMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothInnersMaps(readBoothInners(), map);
      window.localStorage.setItem(
        BOOTH_INNERS_STORAGE_KEY,
        serializeBoothInners(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
