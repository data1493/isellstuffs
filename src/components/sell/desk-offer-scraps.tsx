"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ListingOfferScrap } from "@/components/listing-offer-scrap";
import { formatMoney, type Listing } from "@/lib/commerce";
import {
  offersForStall,
  readListingOffers,
  subscribeListingOffers,
  type ListingOffer,
} from "@/lib/listing-offer";
import { listingOfferPath, sellDeskStallPath } from "@/lib/paths";

export function DeskOfferScraps({
  stallId,
  stallSlug,
  listings,
}: {
  stallId: string;
  stallSlug: string;
  listings: Listing[];
}) {
  const [offers, setOffers] = useState<ListingOffer[]>([]);

  useEffect(() => {
    function apply() {
      setOffers(offersForStall(readListingOffers(), stallId));
    }

    apply();
    return subscribeListingOffers(apply);
  }, [stallId]);

  if (offers.length === 0) {
    return null;
  }

  const titles = new Map(listings.map((listing) => [listing.id, listing]));
  const returnTo = sellDeskStallPath(stallSlug);

  return (
    <div data-desk-offer-scraps="" className="mb-6 space-y-3">
      <p className="text-sm leading-6 text-muted-foreground">
        Haggle scraps taped on this table. Not a new price. The tote still
        rings the tag.
      </p>
      <ul className="grid gap-3">
        {offers.map((offer) => {
          const listing = titles.get(offer.listingId);
          const tagLabel = listing ? formatMoney(listing.price) : "the tag";

          return (
            <li key={offer.id}>
              <ListingOfferScrap
                offer={offer}
                tagLabel={tagLabel}
                title={listing?.title ?? offer.listingId}
                returnTo={returnTo}
              />
              <p className="mt-2">
                <Link
                  href={listingOfferPath(offer.listingId)}
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Open the offer slip
                </Link>
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
