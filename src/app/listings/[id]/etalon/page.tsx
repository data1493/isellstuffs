import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingEtalonView,
  type EtalonViewKind,
  type EtalonViewSheet,
} from "@/components/listing-etalon-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  ETALON_CHAIR_ID,
  ETALON_COOKIE_NAME,
  ETALON_MUG_ID,
  ETALON_REFUSE_COPY,
  ETALON_WHISK_ID,
  canTapeEtalon,
  isListingEtalonOverlay,
  parseEtalonListingIds,
} from "@/lib/listing-etalon";
import { listingEtalonPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type EtalonPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): EtalonViewKind {
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
    return listing.id === ETALON_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === ETALON_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === ETALON_MUG_ID) {
    return "mug";
  }
  if (listing.id === ETALON_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeEtalon(listing)) {
    return "owned";
  }
  return "physical";
}

function etalonSheetForId(
  id: string,
  etalonIds: string[],
): EtalonViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isEtalon: listing
      ? isListingEtalonOverlay(listing.id, etalonIds)
      : false,
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
}: EtalonPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const etalonIds = parseEtalonListingIds(
    jar.get(ETALON_COOKIE_NAME)?.value,
  );
  const sheet = etalonSheetForId(id, etalonIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: ETALON_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an etalon note on.",
      path: listingEtalonPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: ETALON_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an etalon note."
          : sheet.kind === "mug"
            ? "A mug does not take an etalon note. Etalon honesty is for the pot lid."
            : sheet.kind === "whisk"
              ? "A whisk does not take an etalon note. Etalon honesty is for the pot lid."
              : sheet.kind === "chair"
                ? "A chair does not take an etalon note. Etalon honesty is for the pot lid."
                : sheet.kind === "owned"
                  ? "An etalon note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take an etalon note. An etalon note is for the lid on the table.",
      path: listingEtalonPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not etalon it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not etalon it. Still a lid. Still no pot. Still tote. Not brewster. Not haidinger. Not countersink.`,
    path: listingEtalonPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingEtalonPage({
  params,
}: EtalonPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const etalonIds = parseEtalonListingIds(
    jar.get(ETALON_COOKIE_NAME)?.value,
  );
  const sheet = etalonSheetForId(id, etalonIds);

  return <ListingEtalonView sheet={sheet} etalonIds={etalonIds} />;
}
