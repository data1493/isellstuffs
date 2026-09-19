"use client";

import { useEffect } from "react";

import { SPEAKER_STORAGE_KEY, speakerCookieValue } from "@/lib/listing-speaker";

/** Copy the cookie speaker set into `iss:speaker-listing-ids` after a no-JS POST. */
export function SyncSpeaker({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(SPEAKER_STORAGE_KEY, speakerCookieValue(listingIds));
    } catch {
      // blocked storage
    }
  }, [listingIds]);

  return null;
}
