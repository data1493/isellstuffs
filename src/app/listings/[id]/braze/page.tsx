import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBrazeView,
  type BrazeViewKind,
  type BrazeViewSheet,
} from "@/components/listing-braze-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  BRAZE_COOKIE_NAME,
  BRAZE_LID_ID,
  BRAZE_MUG_ID,
  BRAZE_REFUSE_COPY,
  canTapeBraze,
  isListingBrazeOverlay,
  parseBrazeListingIds,
} from "@/lib/listing-braze";
import { listingBrazePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BrazePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BrazeViewKind {
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
  if (listing.id === BRAZE_MUG_ID) {
    return "mug";
  }
  if (listing.id === BRAZE_LID_ID) {
    return "lid";
  }
  if (!canTapeBraze(listing)) {
    return "owned";
  }
  return "physical";
}

function brazeSheetForId(id: string, brazeIds: string[]): BrazeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBraze: listing ? isListingBrazeOverlay(listing.id, brazeIds) : false,
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
}: BrazePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const brazeIds = parseBrazeListingIds(jar.get(BRAZE_COOKIE_NAME)?.value);
  const sheet = brazeSheetForId(id, brazeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BRAZE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a braze note on.",
      path: listingBrazePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: BRAZE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a braze note."
          : sheet.kind === "mug"
            ? "A mug does not take a braze note. Braze honesty is for the balloon whisk."
            : sheet.kind === "lid"
              ? "A lid does not take a braze note. Braze honesty is for the balloon whisk."
              : sheet.kind === "owned"
                ? "A braze note is for the balloon whisk. Another overlay already owns that listing."
                : "A file does not take a braze note. A braze note is for the whisk on the table.",
      path: listingBrazePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not braze it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not braze it. Still bent. Still metal. Still tote. Not quench. Not planish. Not upset.`,
    path: listingBrazePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBrazePage({ params }: BrazePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const brazeIds = parseBrazeListingIds(jar.get(BRAZE_COOKIE_NAME)?.value);
  const sheet = brazeSheetForId(id, brazeIds);

  return <ListingBrazeView sheet={sheet} brazeIds={brazeIds} />;
}
