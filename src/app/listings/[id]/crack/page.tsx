import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCrackView,
  type CrackViewKind,
  type CrackViewSheet,
} from "@/components/listing-crack-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CRACK_COOKIE_NAME,
  CRACK_REFUSE_COPY,
  isListingCrackOverlay,
  parseCrackListingIds,
} from "@/lib/listing-crack";
import { listingCrackPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CrackPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CrackViewKind {
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

function crackSheetForId(id: string, crackIds: string[]): CrackViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCrack: listing ? isListingCrackOverlay(listing.id, crackIds) : false,
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
}: CrackPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const crackIds = parseCrackListingIds(jar.get(CRACK_COOKIE_NAME)?.value);
  const sheet = crackSheetForId(id, crackIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CRACK_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a crack on.",
      path: listingCrackPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: CRACK_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not keep a ceramic crack."
          : "A file does not keep a ceramic crack. Crack honesty is for a lamp on the table.",
      path: listingCrackPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The crack stays · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Cord is rewired. Box is the shade. This is the ceramic/base crack. Still tote. Not cord. Not chip.`,
    path: listingCrackPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCrackPage({ params }: CrackPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const crackIds = parseCrackListingIds(jar.get(CRACK_COOKIE_NAME)?.value);
  const sheet = crackSheetForId(id, crackIds);

  return <ListingCrackView sheet={sheet} crackIds={crackIds} />;
}
