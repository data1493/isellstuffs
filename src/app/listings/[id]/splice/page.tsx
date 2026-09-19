import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSpliceView,
  type SpliceViewKind,
  type SpliceViewSheet,
} from "@/components/listing-splice-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SPLICE_COOKIE_NAME,
  SPLICE_REFUSE_COPY,
  isListingSpliceOverlay,
  parseSpliceListingIds,
} from "@/lib/listing-splice";
import { listingSplicePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SplicePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SpliceViewKind {
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

function spliceSheetForId(id: string, spliceIds: string[]): SpliceViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSplice: listing ? isListingSpliceOverlay(listing.id, spliceIds) : false,
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
}: SplicePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const spliceIds = parseSpliceListingIds(jar.get(SPLICE_COOKIE_NAME)?.value);
  const sheet = spliceSheetForId(id, spliceIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SPLICE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a splice note on.",
      path: listingSplicePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SPLICE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a splice note."
          : "A file does not take a splice note. A splice note is for a cassette on the table.",
      path: listingSplicePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not splice · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not splice. Radio ads stay. Still tote. Still for sale.`,
    path: listingSplicePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSplicePage({ params }: SplicePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const spliceIds = parseSpliceListingIds(jar.get(SPLICE_COOKIE_NAME)?.value);
  const sheet = spliceSheetForId(id, spliceIds);

  return <ListingSpliceView sheet={sheet} spliceIds={spliceIds} />;
}
