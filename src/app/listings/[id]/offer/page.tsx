import type { Metadata } from "next";
import { cookies } from "next/headers";

import { ListingOfferView } from "@/components/listing-offer-view";
import {
  OFFER_COOKIE_NAME,
  offerSheetForId,
  offersForListing,
  parseListingOffers,
} from "@/lib/listing-offer";
import { listingOfferPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type OfferPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: OfferPageProps): Promise<Metadata> {
  const { id } = await params;
  const sheet = offerSheetForId(id);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: "No offer for that listing",
      description: "No SKU with that id. Nothing to tape a number on.",
      path: listingOfferPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: sheet.kind === "gift" ? "No offer on a gift card" : "No offer on a file",
      description: sheet.refuse,
      path: listingOfferPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Offer slip · ${sheet.title}`,
    description: `${sheet.tagLabel} at ${sheet.stallName}. A scrap on the lamp. Not a new price.`,
    path: listingOfferPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingOfferPage({
  params,
  searchParams,
}: OfferPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const sheet = offerSheetForId(id);
  const jar = await cookies();
  const offers = offersForListing(
    parseListingOffers(jar.get(OFFER_COOKIE_NAME)?.value),
    id,
  );

  return <ListingOfferView sheet={sheet} offers={offers} tapeError={error} />;
}
