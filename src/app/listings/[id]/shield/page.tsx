import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingShieldView,
  type ShieldViewKind,
  type ShieldViewSheet,
} from "@/components/listing-shield-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SHIELD_COOKIE_NAME,
  SHIELD_LUT_ID,
  SHIELD_PACK_ID,
  SHIELD_REFUSE_COPY,
  canTapeShield,
  isListingShieldOverlay,
  parseShieldListingIds,
} from "@/lib/listing-shield";
import { listingShieldPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ShieldPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ShieldViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (listing.id === SHIELD_LUT_ID) {
    return "lut";
  }
  if (listing.id === SHIELD_PACK_ID) {
    return "pack";
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
  if (!canTapeShield(listing)) {
    return "owned";
  }
  return "physical";
}

function shieldSheetForId(
  id: string,
  shieldIds: string[],
): ShieldViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isShield: listing
      ? isListingShieldOverlay(listing.id, shieldIds)
      : false,
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
}: ShieldPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const shieldIds = parseShieldListingIds(
    jar.get(SHIELD_COOKIE_NAME)?.value,
  );
  const sheet = shieldSheetForId(id, shieldIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SHIELD_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a shield note on.",
      path: listingShieldPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SHIELD_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a shield note."
          : sheet.kind === "lut"
            ? "A LUT pack does not take a shield note. Shield is a Game Boy board."
            : sheet.kind === "pack"
              ? "A sample pack does not take a shield note. Shield is a Game Boy board."
              : sheet.kind === "owned"
                ? "A shield note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a shield note. A shield note is for the Game Boy on the table.",
      path: listingShieldPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not shield it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not shield it. Still a line. Still Tetris. Still tote. Not reflow. Not contrast. Not deox. Not speaker. Not line.`,
    path: listingShieldPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingShieldPage({
  params,
}: ShieldPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const shieldIds = parseShieldListingIds(
    jar.get(SHIELD_COOKIE_NAME)?.value,
  );
  const sheet = shieldSheetForId(id, shieldIds);

  return <ListingShieldView sheet={sheet} shieldIds={shieldIds} />;
}
