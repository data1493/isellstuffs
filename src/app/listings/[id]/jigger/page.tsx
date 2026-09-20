import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingJiggerView,
  type JiggerViewKind,
  type JiggerViewSheet,
} from "@/components/listing-jigger-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  JIGGER_CHAIR_ID,
  JIGGER_COOKIE_NAME,
  JIGGER_LID_ID,
  JIGGER_REFUSE_COPY,
  JIGGER_WHISK_ID,
  canTapeJigger,
  isListingJiggerOverlay,
  parseJiggerListingIds,
} from "@/lib/listing-jigger";
import { listingJiggerPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type JiggerPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): JiggerViewKind {
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
    return listing.id === JIGGER_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === JIGGER_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === JIGGER_LID_ID) {
    return "lid";
  }
  if (listing.id === JIGGER_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeJigger(listing)) {
    return "owned";
  }
  return "physical";
}

function jiggerSheetForId(id: string, jiggerIds: string[]): JiggerViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isJigger: listing ? isListingJiggerOverlay(listing.id, jiggerIds) : false,
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
}: JiggerPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const jiggerIds = parseJiggerListingIds(jar.get(JIGGER_COOKIE_NAME)?.value);
  const sheet = jiggerSheetForId(id, jiggerIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: JIGGER_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a jigger note on.",
      path: listingJiggerPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: JIGGER_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a jigger note."
          : sheet.kind === "lid"
            ? "A lid does not take a jigger note. Jigger honesty is for the diner mug."
            : sheet.kind === "whisk"
              ? "A whisk does not take a jigger note. Jigger honesty is for the diner mug."
              : sheet.kind === "chair"
                ? "A chair does not take a jigger note. Jigger honesty is for the diner mug."
                : sheet.kind === "owned"
                  ? "A jigger note is for the diner mug. Another overlay already owns that listing."
                  : "A file does not take a jigger note. A jigger note is for the mug on the table.",
      path: listingJiggerPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not jigger it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not jigger it. Still a diner rim. Still holds coffee. Still tote. Not sprig. Not salt. Not pickle.`,
    path: listingJiggerPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingJiggerPage({ params }: JiggerPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const jiggerIds = parseJiggerListingIds(jar.get(JIGGER_COOKIE_NAME)?.value);
  const sheet = jiggerSheetForId(id, jiggerIds);

  return <ListingJiggerView sheet={sheet} jiggerIds={jiggerIds} />;
}
