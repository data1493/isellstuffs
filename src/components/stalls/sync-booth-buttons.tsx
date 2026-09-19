"use client";

import { useEffect } from "react";

import {
  BOOTH_BUTTONS_STORAGE_KEY,
  mergeBoothButtonsMaps,
  readBoothButtons,
  serializeBoothButtons,
  type BoothButtonsMap,
} from "@/lib/booth-buttons";

/** Copy the cookie cork into `iss:booth-buttons` after a no-JS tape. */
export function SyncBoothButtons({ map }: { map: BoothButtonsMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothButtonsMaps(readBoothButtons(), map);
      window.localStorage.setItem(
        BOOTH_BUTTONS_STORAGE_KEY,
        serializeBoothButtons(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
