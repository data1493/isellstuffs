import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingNotchView,
  type NotchViewKind,
  type NotchViewSheet,
} from "@/components/listing-notch-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  NOTCH_CHAIR_ID,
  NOTCH_COOKIE_NAME,
  NOTCH_LAMP_ID,
  NOTCH_REFUSE_COPY,
  NOTCH_SNEAKER_ID,
  canTapeNotch,
  isListingNotchOverlay,
  parseNotchListingIds,
} from "@/lib/listing-notch";
import { listingHubName } from "@/lib/listing-display";
import { listingNotchPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type NotchPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): NotchViewKind {
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
    return listing.id === NOTCH_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === NOTCH_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === NOTCH_SNEAKER_ID) {
    return "sneakers";
  }
  if (listing.id === NOTCH_LAMP_ID) {
    return "lamp";
  }
  if (!canTapeNotch(listing)) {
    return "owned";
  }
  return "physical";
}

function notchSheetForId(id: string, notchIds: string[]): NotchViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isNotch: listing ? isListingNotchOverlay(listing.id, notchIds) : false,
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
}: NotchPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const notchIds = parseNotchListingIds(jar.get(NOTCH_COOKIE_NAME)?.value);
  const sheet = notchSheetForId(id, notchIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: NOTCH_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a notch note on.",
      path: listingNotchPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: NOTCH_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a notch note."
          : sheet.kind === "sneakers"
            ? "Sneakers do not take a notch note. Notch is a jacket clip."
            : sheet.kind === "lamp"
              ? "A lamp does not take a notch note. Notch is a jacket clip."
              : sheet.kind === "chair"
                ? "A chair does not take a notch note. Notch is a jacket clip."
                : sheet.kind === "owned"
                  ? "A notch note is for the windbreaker. Another overlay already owns that listing."
                  : "A file does not take a notch note. A notch note is for the jacket on the table.",
      path: listingNotchPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not notch it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not notch it. Still pits. Still a car smell. Still tote. Not pink. Not darn. Not serge.`,
    path: listingNotchPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingNotchPage({ params }: NotchPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const notchIds = parseNotchListingIds(jar.get(NOTCH_COOKIE_NAME)?.value);
  const sheet = notchSheetForId(id, notchIds);

  return <ListingNotchView sheet={sheet} notchIds={notchIds} />;
}
