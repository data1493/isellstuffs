import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBlowholeView,
  type BlowholeViewKind,
  type BlowholeViewSheet,
} from "@/components/listing-blowhole-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  BLOWHOLE_COOKIE_NAME,
  BLOWHOLE_DRAWER_ID,
  BLOWHOLE_LID_ID,
  BLOWHOLE_REFUSE_COPY,
  canTapeBlowhole,
  isListingBlowholeOverlay,
  parseBlowholeListingIds,
} from "@/lib/listing-blowhole";
import { listingBlowholePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BlowholePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BlowholeViewKind {
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
  if (listing.id === BLOWHOLE_DRAWER_ID) {
    return "drawer";
  }
  if (listing.id === BLOWHOLE_LID_ID) {
    return "lid";
  }
  if (!canTapeBlowhole(listing)) {
    return "owned";
  }
  return "physical";
}

function blowholeSheetForId(id: string, blowholeIds: string[]): BlowholeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBlowhole: listing ? isListingBlowholeOverlay(listing.id, blowholeIds) : false,
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
}: BlowholePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const blowholeIds = parseBlowholeListingIds(
    jar.get(BLOWHOLE_COOKIE_NAME)?.value,
  );
  const sheet = blowholeSheetForId(id, blowholeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BLOWHOLE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a blowhole note on.",
      path: listingBlowholePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: BLOWHOLE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a blowhole note."
          : sheet.kind === "drawer"
            ? "A cable drawer does not take a blowhole note. Blowhole is Game Boy paper."
            : sheet.kind === "lid"
              ? "A pot lid does not take a blowhole note. Blowhole is Game Boy paper."
              : sheet.kind === "owned"
                ? "A blowhole note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a blowhole note. A blowhole note is for the Game Boy on the table.",
      path: listingBlowholePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not blowhole it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not blowhole it. Still a crack. Still Tetris. Still tote. Not icicle. Not dewet. Not underfill.`,
    path: listingBlowholePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBlowholePage({ params }: BlowholePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const blowholeIds = parseBlowholeListingIds(
    jar.get(BLOWHOLE_COOKIE_NAME)?.value,
  );
  const sheet = blowholeSheetForId(id, blowholeIds);

  return <ListingBlowholeView sheet={sheet} blowholeIds={blowholeIds} />;
}
