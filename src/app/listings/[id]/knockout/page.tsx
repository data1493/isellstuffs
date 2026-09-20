import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingKnockoutView,
  type KnockoutViewKind,
  type KnockoutViewSheet,
} from "@/components/listing-knockout-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  KNOCKOUT_COOKIE_NAME,
  KNOCKOUT_REFUSE_COPY,
  canTapeKnockout,
  isListingKnockoutOverlay,
  parseKnockoutListingIds,
} from "@/lib/listing-knockout";
import { listingKnockoutPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type KnockoutPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): KnockoutViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    if (!canTapeKnockout(listing)) {
      return "owned";
    }
    return "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function knockoutSheetForId(id: string, knockoutIds: string[]): KnockoutViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isKnockout: listing ? isListingKnockoutOverlay(listing.id, knockoutIds) : false,
    title: listing?.title ?? null,
    priceLabel: listing ? formatMoney(listing.price) : null,
    fact: listing
      ? isDigitalListing(listing)
        ? listing.fileFormat
        : listing.condition
      : null,
    stallName: stall?.boothName ?? listing?.stallId ?? null,
    stallSlug: stall?.slug ?? null,
    hubName: listing ? listingHubName(listing) : null,
    listing: listing ?? null,
  };
}

export async function generateMetadata({
  params,
}: KnockoutPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const knockoutIds = parseKnockoutListingIds(jar.get(KNOCKOUT_COOKIE_NAME)?.value);
  const sheet = knockoutSheetForId(id, knockoutIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: KNOCKOUT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a knockout note on.",
      path: listingKnockoutPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: KNOCKOUT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a knockout note."
          : sheet.kind === "owned"
            ? "A knockout note is for the stained recipe cards. Another overlay already owns that listing."
            : "A whisk does not take a knockout note. A knockout note is for three recipe cards.",
      path: listingKnockoutPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not knockout them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not knockout them. Still three cards. Still grease. Still tote. Not gang. Not despeckle. Not a shop. Not descreen. Knock out the grease, not a login.`,
    path: listingKnockoutPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingKnockoutPage({ params }: KnockoutPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const knockoutIds = parseKnockoutListingIds(jar.get(KNOCKOUT_COOKIE_NAME)?.value);
  const sheet = knockoutSheetForId(id, knockoutIds);

  return <ListingKnockoutView sheet={sheet} knockoutIds={knockoutIds} />;
}
