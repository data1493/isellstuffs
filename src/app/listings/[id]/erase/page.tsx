import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingEraseView,
  type EraseViewKind,
  type EraseViewSheet,
} from "@/components/listing-erase-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  ERASE_CHAIR_ID,
  ERASE_COOKIE_NAME,
  ERASE_JEWELS_ID,
  ERASE_LP_ID,
  ERASE_REFUSE_COPY,
  canTapeErase,
  isListingEraseOverlay,
  parseEraseListingIds,
} from "@/lib/listing-erase";
import { listingHubName } from "@/lib/listing-display";
import { listingErasePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ErasePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): EraseViewKind {
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
    return listing.id === ERASE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === ERASE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === ERASE_LP_ID) {
    return "lp";
  }
  if (listing.id === ERASE_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeErase(listing)) {
    return "owned";
  }
  return "physical";
}

function eraseSheetForId(id: string, eraseIds: string[]): EraseViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isErase: listing ? isListingEraseOverlay(listing.id, eraseIds) : false,
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
}: ErasePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const eraseIds = parseEraseListingIds(jar.get(ERASE_COOKIE_NAME)?.value);
  const sheet = eraseSheetForId(id, eraseIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: ERASE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an erase note on.",
      path: listingErasePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: ERASE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an erase note."
          : sheet.kind === "lp"
            ? "A record does not take an erase note. Erase is a cassette Side A."
            : sheet.kind === "jewels"
              ? "Empty jewel cases do not take an erase note. Erase is a cassette Side A."
              : sheet.kind === "chair"
                ? "A chair does not take an erase note. Erase is a cassette Side A."
                : sheet.kind === "owned"
                  ? "An erase note is for SUMMER 93. Another overlay already owns that listing."
                  : "A file does not take an erase note. An erase note is for the cassette on the table.",
      path: listingErasePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not erase it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not erase it. Still a radio edit. Still hiss. Still tote. Not degauss. Not dub. Not bake.`,
    path: listingErasePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingErasePage({ params }: ErasePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const eraseIds = parseEraseListingIds(jar.get(ERASE_COOKIE_NAME)?.value);
  const sheet = eraseSheetForId(id, eraseIds);

  return <ListingEraseView sheet={sheet} eraseIds={eraseIds} />;
}
