import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingLacesView,
  type LacesViewKind,
  type LacesViewSheet,
} from "@/components/listing-laces-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  LACES_COOKIE_NAME,
  LACES_REFUSE_COPY,
  listingLacesFor,
  parseListingLaces,
} from "@/lib/listing-laces";
import { listingLacesPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type LacesPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string | string[] }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): LacesViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isPhysicalListing(listing)) {
    return listing.status === "file-gone" ? "file-gone" : "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function lacesSheetForId(
  id: string,
  map: ReturnType<typeof parseListingLaces>,
): LacesViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    current: listing ? listingLacesFor(listing.id, map) : undefined,
    title: listing?.title ?? null,
    priceLabel: listing ? formatMoney(listing.price) : null,
    fact: listing
      ? isPhysicalListing(listing)
        ? listing.condition
        : listing.fileFormat
      : null,
    stallName: stall?.boothName ?? listing?.stallId ?? null,
    stallSlug: stall?.slug ?? null,
    hubName: listing ? listingHubName(listing) : null,
    listing: listing ?? null,
  };
}

export async function generateMetadata({
  params,
}: LacesPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const map = parseListingLaces(jar.get(LACES_COOKIE_NAME)?.value);
  const sheet = lacesSheetForId(id, map);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: LACES_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape laces on.",
      path: listingLacesPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: LACES_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. Files do not wear laces."
          : "A file does not wear laces. Pair paper is for sneakers on the table.",
      path: listingLacesPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I kept the good laces · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Still a pair. Still tote. The nice laces stayed home.`,
    path: listingLacesPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingLacesPage({
  params,
  searchParams,
}: LacesPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const jar = await cookies();
  const map = parseListingLaces(jar.get(LACES_COOKIE_NAME)?.value);
  const sheet = lacesSheetForId(id, map);

  return (
    <ListingLacesView sheet={sheet} map={map} emptyTape={error === "empty"} />
  );
}
