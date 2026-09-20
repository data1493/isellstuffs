import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGimbalView,
  type GimbalViewKind,
  type GimbalViewSheet,
} from "@/components/listing-gimbal-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GIMBAL_CHAIR_ID,
  GIMBAL_COOKIE_NAME,
  GIMBAL_JEWELS_ID,
  GIMBAL_MIXTAPE_ID,
  GIMBAL_REFUSE_COPY,
  canTapeGimbal,
  isListingGimbalOverlay,
  parseGimbalListingIds,
} from "@/lib/listing-gimbal";
import { listingGimbalPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GimbalPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GimbalViewKind {
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
    return listing.id === GIMBAL_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === GIMBAL_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === GIMBAL_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === GIMBAL_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeGimbal(listing)) {
    return "owned";
  }
  return "physical";
}

function gimbalSheetForId(id: string, gimbalIds: string[]): GimbalViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGimbal: listing ? isListingGimbalOverlay(listing.id, gimbalIds) : false,
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
}: GimbalPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const gimbalIds = parseGimbalListingIds(jar.get(GIMBAL_COOKIE_NAME)?.value);
  const sheet = gimbalSheetForId(id, gimbalIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GIMBAL_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a gimbal note on.",
      path: listingGimbalPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: GIMBAL_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a gimbal note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take a gimbal note. Gimbal honesty is for the unnamed LP."
            : sheet.kind === "jewels"
              ? "Empty jewels do not take a gimbal note. Gimbal honesty is for the unnamed LP."
              : sheet.kind === "chair"
                ? "A chair does not take a gimbal note. Gimbal honesty is for the unnamed LP."
                : sheet.kind === "owned"
                  ? "A gimbal note is for the unnamed LP. Another overlay already owns that listing."
                  : "A file does not take a gimbal note. A gimbal note is for the LP on the table.",
      path: listingGimbalPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not gimbal it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not gimbal it. Still a skip. Still unnamed. Still tote. Not antiskate. Not rumble. Not vacuum.`,
    path: listingGimbalPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGimbalPage({ params }: GimbalPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const gimbalIds = parseGimbalListingIds(jar.get(GIMBAL_COOKIE_NAME)?.value);
  const sheet = gimbalSheetForId(id, gimbalIds);

  return <ListingGimbalView sheet={sheet} gimbalIds={gimbalIds} />;
}
