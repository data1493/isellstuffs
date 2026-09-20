"use client";

import { useEffect } from "react";

import {
  BOOTH_FOOTER_STORAGE_KEY,
  mergeBoothFooterMaps,
  readBoothFooter,
  serializeBoothFooter,
  type BoothFooterMap,
} from "@/lib/booth-footer";

/** Copy the cookie cork into `iss:booth-footer` after a no-JS tape. */
export function SyncBoothFooter({ map }: { map: BoothFooterMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothFooterMaps(readBoothFooter(), map);
      window.localStorage.setItem(
        BOOTH_FOOTER_STORAGE_KEY,
        serializeBoothFooter(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
