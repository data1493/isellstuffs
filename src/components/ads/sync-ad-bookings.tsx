"use client";

import { useEffect } from "react";

import {
  AD_BOOKINGS_STORAGE_KEY,
  mergeAdBooking,
  readAdBookings,
  serializeAdBookings,
  type AdBooking,
} from "@/lib/ad-booking";

/** Copy the cookie slip into `iss:ad-bookings` after a no-JS pay. */
export function SyncAdBookings({ booking }: { booking: AdBooking }) {
  useEffect(() => {
    try {
      const next = mergeAdBooking(readAdBookings(), booking);
      window.localStorage.setItem(
        AD_BOOKINGS_STORAGE_KEY,
        serializeAdBookings(next),
      );
    } catch {
      // blocked storage
    }
  }, [booking]);

  return null;
}
