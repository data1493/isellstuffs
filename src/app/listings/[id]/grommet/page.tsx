import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGrommetView,
  type GrommetViewKind,
  type GrommetViewSheet,
} from "@/components/listing-grommet-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  GROMMET_BOY_ID,
  GROMMET_CHAIR_ID,
  GROMMET_COOKIE_NAME,
  GROMMET_REFUSE_COPY,
  canTapeGrommet,
  isListingGrommetOverlay,
  parseGrommetListingIds,
} from "@/lib/listing-grommet";
import { listingHubName } from "@/lib/listing-display";
import { listingGrommetPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GrommetPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GrommetViewKind {
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
    return listing.id === GROMMET_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === GROMMET_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === GROMMET_BOY_ID) {
    return "boy";
  }
  if (!canTapeGrommet(listing)) {
    return "owned";
  }
  return "physical";
}

function grommetSheetForId(id: string, grommetIds: string[]): GrommetViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGrommet: listing ? isListingGrommetOverlay(listing.id, grommetIds) : false,
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
}: GrommetPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const grommetIds = parseGrommetListingIds(
    jar.get(GROMMET_COOKIE_NAME)?.value,
  );
  const sheet = grommetSheetForId(id, grommetIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GROMMET_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a grommet note on.",
      path: listingGrommetPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: GROMMET_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a grommet note."
          : sheet.kind === "chair"
            ? "A chair does not take a grommet note. Grommet is a lamp shade."
            : sheet.kind === "boy"
              ? "A Game Boy does not take a grommet note. Grommet is a lamp shade."
              : sheet.kind === "owned"
                ? "A grommet note is for the wobbly lamp. Another overlay already owns that listing."
                : "A file does not take a grommet note. A grommet note is for the lamp on the table.",
      path: listingGrommetPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not grommet it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not grommet it. Still a tired box. Still a wobbly neck. Still tote. Not twist. Not LED. Not the box.`,
    path: listingGrommetPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGrommetPage({ params }: GrommetPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const grommetIds = parseGrommetListingIds(
    jar.get(GROMMET_COOKIE_NAME)?.value,
  );
  const sheet = grommetSheetForId(id, grommetIds);

  return <ListingGrommetView sheet={sheet} grommetIds={grommetIds} />;
}
