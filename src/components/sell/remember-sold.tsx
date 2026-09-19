"use client";

import { useEffect } from "react";

import { sellDeskSoldPath } from "@/lib/paths";
import { addPhysicalIdsToSold, soldStampScript } from "@/lib/sold-overlay";

/** Writes physical slip lines into the sold overlay. Digital files stay for sale. */
export function RememberSold({ listingIds }: { listingIds: readonly string[] }) {
  useEffect(() => {
    if (listingIds.length === 0) {
      return;
    }
    addPhysicalIdsToSold(listingIds);
    void Promise.all(
      listingIds.map((listingId) =>
        fetch(sellDeskSoldPath(), {
          method: "POST",
          credentials: "same-origin",
          body: new URLSearchParams({
            listingId,
            intent: "sold",
            returnTo: "/checkout/success",
          }),
        }),
      ),
    );
  }, [listingIds]);

  if (listingIds.length === 0) {
    return null;
  }

  return (
    <script dangerouslySetInnerHTML={{ __html: soldStampScript(listingIds) }} />
  );
}
