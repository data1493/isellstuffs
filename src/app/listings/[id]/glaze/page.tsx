import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGlazeView,
  type GlazeViewKind,
  type GlazeViewSheet,
} from "@/components/listing-glaze-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  GLAZE_CHAIR_ID,
  GLAZE_COOKIE_NAME,
  GLAZE_LID_ID,
  GLAZE_REFUSE_COPY,
  GLAZE_WHISK_ID,
  canTapeGlaze,
  isListingGlazeOverlay,
  parseGlazeListingIds,
} from "@/lib/listing-glaze";
import { listingHubName } from "@/lib/listing-display";
import { listingGlazePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GlazePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GlazeViewKind {
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
    return listing.id === GLAZE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === GLAZE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === GLAZE_LID_ID) {
    return "lid";
  }
  if (listing.id === GLAZE_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeGlaze(listing)) {
    return "owned";
  }
  return "physical";
}

function glazeSheetForId(id: string, glazeIds: string[]): GlazeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGlaze: listing ? isListingGlazeOverlay(listing.id, glazeIds) : false,
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
}: GlazePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const glazeIds = parseGlazeListingIds(jar.get(GLAZE_COOKIE_NAME)?.value);
  const sheet = glazeSheetForId(id, glazeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GLAZE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a glaze note on.",
      path: listingGlazePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: GLAZE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a glaze note."
          : sheet.kind === "lid"
            ? "A lid does not take a glaze note. Glaze is a mug rim."
            : sheet.kind === "whisk"
              ? "A whisk does not take a glaze note. Glaze is a mug rim."
              : sheet.kind === "chair"
                ? "A chair does not take a glaze note. Glaze is a mug rim."
                : sheet.kind === "owned"
                  ? "A glaze note is for the diner mug. Another overlay already owns that listing."
                  : "A file does not take a glaze note. A glaze note is for the mug on the table.",
      path: listingGlazePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not glaze it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not glaze it. Still a chip. Still a mug. Still tote. Not gilt. Not chip. Not handle.`,
    path: listingGlazePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGlazePage({ params }: GlazePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const glazeIds = parseGlazeListingIds(jar.get(GLAZE_COOKIE_NAME)?.value);
  const sheet = glazeSheetForId(id, glazeIds);

  return <ListingGlazeView sheet={sheet} glazeIds={glazeIds} />;
}
