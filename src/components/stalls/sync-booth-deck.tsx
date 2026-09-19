"use client";

import { useEffect } from "react";

import {
  BOOTH_DECK_STORAGE_KEY,
  mergeBoothDeckMaps,
  readBoothDeck,
  serializeBoothDeck,
  type BoothDeckMap,
} from "@/lib/booth-deck";

/** Copy the cookie cork into `iss:booth-deck` after a no-JS tape. */
export function SyncBoothDeck({ map }: { map: BoothDeckMap }) {
  useEffect(() => {
    try {
      const next = mergeBoothDeckMaps(readBoothDeck(), map);
      window.localStorage.setItem(
        BOOTH_DECK_STORAGE_KEY,
        serializeBoothDeck(next),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
