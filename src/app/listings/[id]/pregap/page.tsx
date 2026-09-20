import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPregapView,
  type PregapViewKind,
  type PregapViewSheet,
} from "@/components/listing-pregap-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  PREGAP_CHAIR_ID,
  PREGAP_COOKIE_NAME,
  PREGAP_LINER_ID,
  PREGAP_MIXTAPE_ID,
  PREGAP_PACK_ID,
  PREGAP_REFUSE_COPY,
  canTapePregap,
  isListingPregapOverlay,
  parsePregapListingIds,
} from "@/lib/listing-pregap";
import { listingPregapPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PregapPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PregapViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (listing.id === PREGAP_PACK_ID) {
    return "pack";
  }
  if (listing.id === PREGAP_LINER_ID) {
    return "liner";
  }
  if (!isPhysicalListing(listing)) {
    return listing.status === "file-gone" ? "file-gone" : "digital";
  }
  if (listing.status === "sold") {
    return listing.id === PREGAP_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === PREGAP_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === PREGAP_MIXTAPE_ID) {
    return "mixtape";
  }
  if (!canTapePregap(listing)) {
    return "owned";
  }
  return "physical";
}

function pregapSheetForId(id: string, pregapIds: string[]): PregapViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPregap: listing ? isListingPregapOverlay(listing.id, pregapIds) : false,
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
}: PregapPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const pregapIds = parsePregapListingIds(jar.get(PREGAP_COOKIE_NAME)?.value);
  const sheet = pregapSheetForId(id, pregapIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PREGAP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a pregap note on.",
      path: listingPregapPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: PREGAP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a pregap note."
          : sheet.kind === "pack"
            ? "A sample pack does not take a pregap note. Pregap is a disc lead-in."
            : sheet.kind === "mixtape"
              ? "A cassette does not take a pregap note. Pregap is a disc lead-in."
              : sheet.kind === "liner"
                ? "A liner PDF does not take a pregap note. Pregap is a disc lead-in."
                : sheet.kind === "chair"
                  ? "A chair does not take a pregap note. Pregap is a disc lead-in."
                  : sheet.kind === "owned"
                    ? "A pregap note is for BEATS 07. Another overlay already owns that listing."
                    : "A file does not take a pregap note. A pregap note is for the burned disc on the table.",
      path: listingPregapPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not pregap it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not pregap it. Still a burn. Still scratched. Still tote. Not cue. Not encode. Not finalize.`,
    path: listingPregapPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPregapPage({ params }: PregapPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const pregapIds = parsePregapListingIds(jar.get(PREGAP_COOKIE_NAME)?.value);
  const sheet = pregapSheetForId(id, pregapIds);

  return <ListingPregapView sheet={sheet} pregapIds={pregapIds} />;
}
