"use client";

import { useEffect } from "react";

import {
  LACES_STORAGE_KEY,
  listingLacesCookieValue,
  type ListingLacesMap,
} from "@/lib/listing-laces";

/** Copy the cookie laces map into `iss:listing-laces` after a no-JS POST. */
export function SyncLaces({ map }: { map: ListingLacesMap }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        LACES_STORAGE_KEY,
        listingLacesCookieValue(map),
      );
    } catch {
      // blocked storage
    }
  }, [map]);

  return null;
}
