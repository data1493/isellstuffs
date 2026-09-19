"use client";

import { useEffect } from "react";

import { CASES_STORAGE_KEY, casesCookieValue } from "@/lib/listing-cases";

/** Copy the cookie empty-case set into `iss:cases-listing-ids` after a no-JS POST. */
export function SyncCases({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        CASES_STORAGE_KEY,
        casesCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
