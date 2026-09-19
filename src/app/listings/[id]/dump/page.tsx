import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingDumpView,
  type DumpViewKind,
  type DumpViewSheet,
} from "@/components/listing-dump-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  DUMP_COOKIE_NAME,
  DUMP_REFUSE_COPY,
  isListingDumpOverlay,
  parseDumpListingIds,
} from "@/lib/listing-dump";
import { listingDumpPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DumpPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): DumpViewKind {
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

function dumpSheetForId(id: string, dumpIds: string[]): DumpViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isDump: listing ? isListingDumpOverlay(listing.id, dumpIds) : false,
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
}: DumpPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const dumpIds = parseDumpListingIds(jar.get(DUMP_COOKIE_NAME)?.value);
  const sheet = dumpSheetForId(id, dumpIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: DUMP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a dump refusal on.",
      path: listingDumpPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: DUMP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a cart."
          : "A file is not a Game Boy. A dump refusal is for a handheld on the table.",
      path: listingDumpPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I don't dump · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Cells are the AAs out. Line is the screen. Manual is no booklet. This is the dump refusal. Press start. Still tote. Not cells. Not a ROM shop.`,
    path: listingDumpPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingDumpPage({ params }: DumpPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const dumpIds = parseDumpListingIds(jar.get(DUMP_COOKIE_NAME)?.value);
  const sheet = dumpSheetForId(id, dumpIds);

  return <ListingDumpView sheet={sheet} dumpIds={dumpIds} />;
}
