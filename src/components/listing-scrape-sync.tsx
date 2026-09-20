"use client";

import { useEffect } from "react";

import {
  SCRAPE_STORAGE_KEY,
  scrapeCookieValue,
} from "@/lib/listing-scrape";

/** Copy the cookie scrape set into `iss:scrape-listing-ids` after a no-JS POST. */
export function SyncScrape({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SCRAPE_STORAGE_KEY,
        scrapeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
