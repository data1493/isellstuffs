"use client";

import { useEffect } from "react";

import {
  RASTER_STORAGE_KEY,
  rasterCookieValue,
} from "@/lib/listing-raster";

/** Copy the cookie raster set into `iss:raster-listing-ids` after a no-JS POST. */
export function SyncRaster({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        RASTER_STORAGE_KEY,
        rasterCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
