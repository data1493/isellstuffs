import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingAcfView,
  type AcfViewKind,
  type AcfViewSheet,
} from "@/components/listing-acf-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  ACF_COOKIE_NAME,
  ACF_DRAWER_ID,
  ACF_LID_ID,
  ACF_REFUSE_COPY,
  canTapeAcf,
  isListingAcfOverlay,
  parseAcfListingIds,
} from "@/lib/listing-acf";
import { listingAcfPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type AcfPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): AcfViewKind {
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
  if (listing.id === ACF_DRAWER_ID) {
    return "drawer";
  }
  if (listing.id === ACF_LID_ID) {
    return "lid";
  }
  if (!canTapeAcf(listing)) {
    return "owned";
  }
  return "physical";
}

function acfSheetForId(id: string, acfIds: string[]): AcfViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isAcf: listing ? isListingAcfOverlay(listing.id, acfIds) : false,
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
}: AcfPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const acfIds = parseAcfListingIds(jar.get(ACF_COOKIE_NAME)?.value);
  const sheet = acfSheetForId(id, acfIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: ACF_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an acf note on.",
      path: listingAcfPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: ACF_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an acf note."
          : sheet.kind === "drawer"
            ? "A cable drawer does not take an acf note. Acf is a Game Boy film."
            : sheet.kind === "lid"
              ? "A pot lid does not take an acf note. Acf is a Game Boy film."
              : sheet.kind === "owned"
                ? "An acf note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take an acf note. An acf note is for the Game Boy on the table.",
      path: listingAcfPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not acf it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not acf it. Still a crack. Still Tetris. Still tote. Not soak. Not hotbar. Not underfill.`,
    path: listingAcfPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingAcfPage({ params }: AcfPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const acfIds = parseAcfListingIds(jar.get(ACF_COOKIE_NAME)?.value);
  const sheet = acfSheetForId(id, acfIds);

  return <ListingAcfView sheet={sheet} acfIds={acfIds} />;
}
