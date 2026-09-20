import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingZenithView,
  type ZenithViewKind,
  type ZenithViewSheet,
} from "@/components/listing-zenith-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  ZENITH_CHAIR_ID,
  ZENITH_COOKIE_NAME,
  ZENITH_JEWELS_ID,
  ZENITH_MIXTAPE_ID,
  ZENITH_REFUSE_COPY,
  canTapeZenith,
  isListingZenithOverlay,
  parseZenithListingIds,
} from "@/lib/listing-zenith";
import { listingZenithPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ZenithPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ZenithViewKind {
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
    return listing.id === ZENITH_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === ZENITH_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === ZENITH_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === ZENITH_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeZenith(listing)) {
    return "owned";
  }
  return "physical";
}

function zenithSheetForId(id: string, zenithIds: string[]): ZenithViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isZenith: listing ? isListingZenithOverlay(listing.id, zenithIds) : false,
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
}: ZenithPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const zenithIds = parseZenithListingIds(jar.get(ZENITH_COOKIE_NAME)?.value);
  const sheet = zenithSheetForId(id, zenithIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: ZENITH_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a zenith note on.",
      path: listingZenithPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: ZENITH_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a zenith note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take a zenith note. Zenith honesty is for the unnamed LP."
            : sheet.kind === "jewels"
              ? "Empty jewels do not take a zenith note. Zenith honesty is for the unnamed LP."
              : sheet.kind === "chair"
                ? "A chair does not take a zenith note. Zenith honesty is for the unnamed LP."
                : sheet.kind === "owned"
                  ? "A zenith note is for the unnamed LP. Another overlay already owns that listing."
                  : "A file does not take a zenith note. A zenith note is for the LP on the table.",
      path: listingZenithPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not zenith it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not zenith it. Still a skip. Still unnamed. Still tote. Not vacuum. Not azimuth. Not overhang.`,
    path: listingZenithPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingZenithPage({ params }: ZenithPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const zenithIds = parseZenithListingIds(jar.get(ZENITH_COOKIE_NAME)?.value);
  const sheet = zenithSheetForId(id, zenithIds);

  return <ListingZenithView sheet={sheet} zenithIds={zenithIds} />;
}
