import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBeepView,
  type BeepViewKind,
  type BeepViewSheet,
} from "@/components/listing-beep-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  BEEP_COOKIE_NAME,
  BEEP_REFUSE_COPY,
  isListingBeepOverlay,
  parseBeepListingIds,
} from "@/lib/listing-beep";
import { listingBeepPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BeepPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BeepViewKind {
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

function beepSheetForId(id: string, beepIds: string[]): BeepViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBeep: listing ? isListingBeepOverlay(listing.id, beepIds) : false,
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
}: BeepPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const beepIds = parseBeepListingIds(jar.get(BEEP_COOKIE_NAME)?.value);
  const sheet = beepSheetForId(id, beepIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BEEP_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a beep note on.",
      path: listingBeepPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: BEEP_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a beep note."
          : "A file does not take a beep note. A beep note is for a drawer on the table.",
      path: listingBeepPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not beep it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not beep it. Untested tangle. Still a pile. Still tote. Not a meter. Still for sale.`,
    path: listingBeepPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBeepPage({ params }: BeepPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const beepIds = parseBeepListingIds(jar.get(BEEP_COOKIE_NAME)?.value);
  const sheet = beepSheetForId(id, beepIds);

  return <ListingBeepView sheet={sheet} beepIds={beepIds} />;
}
