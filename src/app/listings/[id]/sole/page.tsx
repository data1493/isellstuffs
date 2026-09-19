import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSoleView,
  type SoleViewKind,
  type SoleViewSheet,
} from "@/components/listing-sole-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SOLE_COOKIE_NAME,
  SOLE_REFUSE_COPY,
  isListingSoleOverlay,
  parseSoleListingIds,
} from "@/lib/listing-sole";
import { listingSolePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SolePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SoleViewKind {
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

function soleSheetForId(id: string, soleIds: string[]): SoleViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSole: listing ? isListingSoleOverlay(listing.id, soleIds) : false,
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
}: SolePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const soleIds = parseSoleListingIds(jar.get(SOLE_COOKIE_NAME)?.value);
  const sheet = soleSheetForId(id, soleIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SOLE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a cobbler refusal on.",
      path: listingSolePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SOLE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a cobbler."
          : "A file does not walk. A cobbler refusal is for sneakers on the table.",
      path: listingSolePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not resole · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Peel is the toe. Laces stayed home. This is the cobbler refusal. Both still walk. Still tote. Not toe. Not laces.`,
    path: listingSolePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSolePage({ params }: SolePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const soleIds = parseSoleListingIds(jar.get(SOLE_COOKIE_NAME)?.value);
  const sheet = soleSheetForId(id, soleIds);

  return <ListingSoleView sheet={sheet} soleIds={soleIds} />;
}
