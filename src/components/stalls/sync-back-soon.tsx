"use client";

import { useEffect } from "react";

import {
  BACK_SOON_STORAGE_KEY,
  mergeBackSoonMaps,
  readBackSoon,
  serializeBackSoon,
  type BackSoonMap,
} from "@/lib/back-soon";

/** Copy the cookie cork into `iss:back-soon` after a no-JS tape. */
export function SyncBackSoon({ map }: { map: BackSoonMap }) {
  useEffect(() => {
    try {
      const next = mergeBackSoonMaps(readBackSoon(), map);
      window.localStorage.setItem(
        BACK_SOON_STORAGE_KEY,
        serializeBackSoon(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
