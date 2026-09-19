import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingLabelView,
  type LabelViewKind,
  type LabelViewSheet,
} from "@/components/listing-label-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  LABEL_COOKIE_NAME,
  LABEL_REFUSE_COPY,
  isListingLabelOverlay,
  parseLabelListingIds,
} from "@/lib/listing-label";
import { listingLabelPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type LabelPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): LabelViewKind {
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

function labelSheetForId(id: string, labelIds: string[]): LabelViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isLabel: listing ? isListingLabelOverlay(listing.id, labelIds) : false,
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
}: LabelPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const labelIds = parseLabelListingIds(jar.get(LABEL_COOKIE_NAME)?.value);
  const sheet = labelSheetForId(id, labelIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: LABEL_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a label note on.",
      path: listingLabelPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: LABEL_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a cable label."
          : "A file does not take a cable label. A label note is for a drawer on the table.",
      path: listingLabelPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not label them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not label them. Still a pile. Still untested. Still tote. Not pile. Not a shop. Not beep.`,
    path: listingLabelPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingLabelPage({ params }: LabelPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const labelIds = parseLabelListingIds(jar.get(LABEL_COOKIE_NAME)?.value);
  const sheet = labelSheetForId(id, labelIds);

  return <ListingLabelView sheet={sheet} labelIds={labelIds} />;
}
