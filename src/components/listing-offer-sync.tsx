"use client";

import { useEffect } from "react";

import {
  OFFER_STORAGE_KEY,
  serializeListingOffers,
  type ListingOffer,
} from "@/lib/listing-offer";

/** Copy the cookie cork into `iss:listing-offers` after a no-JS tape. */
export function SyncOffers({ offers }: { offers: ListingOffer[] }) {
  useEffect(() => {
    try {
      window.localStorage.setItem(
        OFFER_STORAGE_KEY,
        serializeListingOffers(offers),
      );
    } catch {
      // blocked storage
    }
  }, [offers]);

  return null;
}
