"use client";

import { useEffect } from "react";

import {
  SCAN_STORAGE_KEY,
  type ListingScanPair,
  scanCookieValue,
} from "@/lib/listing-scan";

/** Copy the cookie pair set into `iss:listing-scan-pairs` after a no-JS POST. */
export function SyncScan({ pairs }: { pairs: ListingScanPair[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(SCAN_STORAGE_KEY, scanCookieValue(pairs));
    } catch {
      // blocked storage
    }
  }, [pairs]);

  return null;
}
