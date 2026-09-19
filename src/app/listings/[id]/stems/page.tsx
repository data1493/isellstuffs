import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingStemsView,
  type StemsViewKind,
  type StemsViewSheet,
} from "@/components/listing-stems-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  STEMS_COOKIE_NAME,
  STEMS_REFUSE_COPY,
  isListingStemsOverlay,
  parseStemsListingIds,
} from "@/lib/listing-stems";
import { listingStemsPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StemsPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): StemsViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (isDigitalListing(listing)) {
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

function stemsSheetForId(id: string, stemsIds: string[]): StemsViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isStems: listing ? isListingStemsOverlay(listing.id, stemsIds) : false,
    title: listing?.title ?? null,
    priceLabel: listing ? formatMoney(listing.price) : null,
    fact: listing
      ? isDigitalListing(listing)
        ? listing.fileFormat
        : listing.condition
      : null,
    stallName: stall?.boothName ?? listing?.stallId ?? null,
    stallSlug: stall?.slug ?? null,
    hubName: listing ? listingHubName(listing) : null,
    listing: listing ?? null,
  };
}

export async function generateMetadata({
  params,
}: StemsPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const stemsIds = parseStemsListingIds(jar.get(STEMS_COOKIE_NAME)?.value);
  const sheet = stemsSheetForId(id, stemsIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: STEMS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a shot count on.",
      path: listingStemsPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: STEMS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a twelve-shot pack."
          : "A lamp is not a shot count. Twelve shots is for a file on the digital lot.",
      path: listingStemsPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `These twelve shots · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. The pack is twelve shots, not a stem kit. Grade is I don't grade. Still tote.`,
    path: listingStemsPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingStemsPage({ params }: StemsPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const stemsIds = parseStemsListingIds(jar.get(STEMS_COOKIE_NAME)?.value);
  const sheet = stemsSheetForId(id, stemsIds);

  return <ListingStemsView sheet={sheet} stemsIds={stemsIds} />;
}
