import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingKnobView,
  type KnobViewKind,
  type KnobViewSheet,
} from "@/components/listing-knob-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  KNOB_COOKIE_NAME,
  KNOB_REFUSE_COPY,
  isListingKnobOverlay,
  parseKnobListingIds,
} from "@/lib/listing-knob";
import { listingKnobPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type KnobPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): KnobViewKind {
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

function knobSheetForId(id: string, knobIds: string[]): KnobViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isKnob: listing ? isListingKnobOverlay(listing.id, knobIds) : false,
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
}: KnobPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const knobIds = parseKnobListingIds(jar.get(KNOB_COOKIE_NAME)?.value);
  const sheet = knobSheetForId(id, knobIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: KNOB_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a knob on.",
      path: listingKnobPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: KNOB_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not keep a loose knob."
          : "A file does not keep a loose knob. Knob honesty is for a pot lid on the table.",
      path: listingKnobPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The knob stays loose · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not tighten it. Still tote. Fits is the 3-quart. Chip is the mug. This is the pot-lid knob. Not fits. Not bent.`,
    path: listingKnobPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingKnobPage({ params }: KnobPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const knobIds = parseKnobListingIds(jar.get(KNOB_COOKIE_NAME)?.value);
  const sheet = knobSheetForId(id, knobIds);

  return <ListingKnobView sheet={sheet} knobIds={knobIds} />;
}
