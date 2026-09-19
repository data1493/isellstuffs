import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSandView,
  type SandViewKind,
  type SandViewSheet,
} from "@/components/listing-sand-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SAND_COOKIE_NAME,
  SAND_REFUSE_COPY,
  isListingSandOverlay,
  parseSandListingIds,
} from "@/lib/listing-sand";
import { listingSandPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SandPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SandViewKind {
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

function sandSheetForId(id: string, sandIds: string[]): SandViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSand: listing ? isListingSandOverlay(listing.id, sandIds) : false,
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
}: SandPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const sandIds = parseSandListingIds(jar.get(SAND_COOKIE_NAME)?.value);
  const sheet = sandSheetForId(id, sandIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SAND_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a sand note on.",
      path: listingSandPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SAND_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a sand note."
          : "A recipe scan does not take a sand. A sand note is for mugs on the table.",
      path: listingSandPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not sand it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not sand it. Chip stays. Still a mug. Still tote. Not chip. Not a shop. Not saucer.`,
    path: listingSandPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSandPage({ params }: SandPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const sandIds = parseSandListingIds(jar.get(SAND_COOKIE_NAME)?.value);
  const sheet = sandSheetForId(id, sandIds);

  return <ListingSandView sheet={sheet} sandIds={sandIds} />;
}
