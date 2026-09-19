"use client";

import { useEffect } from "react";

import { isPhysicalListing, listingById } from "@/lib/commerce";
import { sellDeskSoldPath } from "@/lib/paths";
import { addPhysicalIdsToSold } from "@/lib/sold-overlay";

/** Writes physical slip lines into the sold overlay. Digital files stay for sale. */
export function RememberSold({ listingIds }: { listingIds: readonly string[] }) {
  useEffect(() => {
    if (listingIds.length === 0) {
      return;
    }
    const physicalIds = listingIds.filter((id) => {
      const listing = listingById(id);
      return listing ? isPhysicalListing(listing) : false;
    });
    if (physicalIds.length === 0) {
      return;
    }
    addPhysicalIdsToSold(physicalIds);
    for (const listingId of physicalIds) {
      const body = new URLSearchParams({
        listingId,
        intent: "sold",
        returnTo: "/checkout/success",
      });
      void fetch(sellDeskSoldPath(), {
        method: "POST",
        body,
        redirect: "manual",
        keepalive: true,
      });
    }
  }, [listingIds]);

  return null;
}
