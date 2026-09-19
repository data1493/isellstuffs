"use client";

import { useEffect } from "react";

import { KNOB_STORAGE_KEY, knobCookieValue } from "@/lib/listing-knob";

/** Copy the cookie knob set into `iss:knob-listing-ids` after a no-JS POST. */
export function SyncKnob({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(KNOB_STORAGE_KEY, knobCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
