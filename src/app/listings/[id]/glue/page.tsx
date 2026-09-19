import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGlueView,
  type GlueViewKind,
  type GlueViewSheet,
} from "@/components/listing-glue-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GLUE_COOKIE_NAME,
  GLUE_REFUSE_COPY,
  isListingGlueOverlay,
  parseGlueListingIds,
} from "@/lib/listing-glue";
import { listingGluePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GluePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GlueViewKind {
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
  return "physical";
}

function glueSheetForId(id: string, glueIds: string[]): GlueViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGlue: listing ? isListingGlueOverlay(listing.id, glueIds) : false,
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
}: GluePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const glueIds = parseGlueListingIds(jar.get(GLUE_COOKIE_NAME)?.value);
  const sheet = glueSheetForId(id, glueIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GLUE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a glue refusal on.",
      path: listingGluePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: GLUE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take glue."
          : "A file does not glue. A glue refusal is for a handheld on the table.",
      path: listingGluePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not glue · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Line is the screen. Dump is no ROM. Cells are the AAs. I will not glue. Press start. Still tote. Not line. Not a glue shop. Not dump.`,
    path: listingGluePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGluePage({ params }: GluePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const glueIds = parseGlueListingIds(jar.get(GLUE_COOKIE_NAME)?.value);
  const sheet = glueSheetForId(id, glueIds);

  return <ListingGlueView sheet={sheet} glueIds={glueIds} />;
}
