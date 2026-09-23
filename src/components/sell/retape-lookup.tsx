"use client";

import { useEffect, useState } from "react";

import { RetapeForm } from "@/components/sell/retape-form";
import { RetapeRefuse } from "@/components/sell/retape-refuse";
import { MallLoading } from "@/components/mall-notice";
import type { Listing } from "@/lib/commerce";
import { sellerListingById } from "@/lib/seller-overlay";

export function RetapeLookup({
  listingId,
  error,
}: {
  listingId: string;
  error?: string;
}) {
  const [listing, setListing] = useState<Listing | null | undefined>(undefined);

  useEffect(() => {
    setListing(sellerListingById(listingId) ?? null);
  }, [listingId]);

  if (listing === undefined) {
    return <MallLoading label="Finding the tape…" />;
  }

  if (!listing) {
    return <RetapeRefuse kind="missing" />;
  }

  return <RetapeForm listing={listing} error={error} />;
}
