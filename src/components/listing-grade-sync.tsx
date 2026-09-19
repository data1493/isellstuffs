"use client";

import { useEffect } from "react";

import { GRADE_STORAGE_KEY, gradeCookieValue } from "@/lib/listing-grade";

/** Copy the cookie grade set into `iss:grade-listing-ids` after a no-JS POST. */
export function SyncGrade({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        GRADE_STORAGE_KEY,
        gradeCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
