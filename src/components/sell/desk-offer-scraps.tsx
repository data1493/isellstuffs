import { cookies } from "next/headers";
import Link from "next/link";

import { ListingOfferScrap } from "@/components/listing-offer-scrap";
import { formatMoney, listingById, type Listing } from "@/lib/commerce";
import {
  OFFER_COOKIE_NAME,
  offersForStall,
  parseListingOffers,
} from "@/lib/listing-offer";
import { listingOfferPath, sellDeskStallPath } from "@/lib/paths";

export async function DeskOfferScraps({
  stallId,
  stallSlug,
  listings,
}: {
  stallId: string;
  stallSlug: string;
  listings: Listing[];
}) {
  const jar = await cookies();
  const offers = offersForStall(
    parseListingOffers(jar.get(OFFER_COOKIE_NAME)?.value),
    stallId,
  );

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
          const listing = titles.get(offer.listingId) ?? listingById(offer.listingId);
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
