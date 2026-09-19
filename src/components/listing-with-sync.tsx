"use client";

import { useEffect } from "react";

import {
  WITH_STORAGE_KEY,
  type ListingWithPair,
  withCookieValue,
} from "@/lib/listing-with";

/** Copy the cookie pair set into `iss:listing-with-pairs` after a no-JS POST. */
export function SyncWith({ pairs }: { pairs: ListingWithPair[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(WITH_STORAGE_KEY, withCookieValue(pairs));
    } catch {
      // blocked storage
    }
  }, [pairs]);

  return null;
}
