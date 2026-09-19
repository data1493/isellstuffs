"use client";

import { useEffect } from "react";

import {
  PRESS_STORAGE_KEY,
  listingPressCookieValue,
  type ListingPressMap,
} from "@/lib/listing-press";

/** Copy the cookie press map into `iss:listing-press` after a no-JS POST. */
export function SyncPress({ map }: { map: ListingPressMap }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(PRESS_STORAGE_KEY, listingPressCookieValue(map));
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
