"use client";

import { useEffect } from "react";

import {
  CALENDER_STORAGE_KEY,
  calenderCookieValue,
} from "@/lib/listing-calender";

/** Copy the cookie calender set into `iss:calender-listing-ids` after a no-JS POST. */
export function SyncCalender({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        CALENDER_STORAGE_KEY,
        calenderCookieValue(listingIds),
      );
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
