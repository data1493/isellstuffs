import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingIcicleView,
  type IcicleViewKind,
  type IcicleViewSheet,
} from "@/components/listing-icicle-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  ICICLE_COOKIE_NAME,
  ICICLE_DRAWER_ID,
  ICICLE_LID_ID,
  ICICLE_REFUSE_COPY,
  canTapeIcicle,
  isListingIcicleOverlay,
  parseIcicleListingIds,
} from "@/lib/listing-icicle";
import { listingIciclePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type IciclePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): IcicleViewKind {
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
  if (listing.id === ICICLE_DRAWER_ID) {
    return "drawer";
  }
  if (listing.id === ICICLE_LID_ID) {
    return "lid";
  }
  if (!canTapeIcicle(listing)) {
    return "owned";
  }
  return "physical";
}

function icicleSheetForId(id: string, icicleIds: string[]): IcicleViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isIcicle: listing ? isListingIcicleOverlay(listing.id, icicleIds) : false,
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
}: IciclePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const icicleIds = parseIcicleListingIds(
    jar.get(ICICLE_COOKIE_NAME)?.value,
  );
  const sheet = icicleSheetForId(id, icicleIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: ICICLE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an icicle note on.",
      path: listingIciclePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: ICICLE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take an icicle note."
          : sheet.kind === "drawer"
            ? "A cable drawer does not take an icicle note. Icicle is Game Boy paper."
            : sheet.kind === "lid"
              ? "A pot lid does not take an icicle note. Icicle is Game Boy paper."
              : sheet.kind === "owned"
                ? "An icicle note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take an icicle note. An icicle note is for the Game Boy on the table.",
      path: listingIciclePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not icicle it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not icicle it. Still a crack. Still Tetris. Still tote. Not dewet. Not pillow. Not underfill.`,
    path: listingIciclePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingIciclePage({ params }: IciclePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const icicleIds = parseIcicleListingIds(
    jar.get(ICICLE_COOKIE_NAME)?.value,
  );
  const sheet = icicleSheetForId(id, icicleIds);

  return <ListingIcicleView sheet={sheet} icicleIds={icicleIds} />;
}
