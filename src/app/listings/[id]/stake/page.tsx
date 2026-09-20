import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingStakeView,
  type StakeViewKind,
  type StakeViewSheet,
} from "@/components/listing-stake-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  STAKE_CHAIR_ID,
  STAKE_COOKIE_NAME,
  STAKE_MUG_ID,
  STAKE_REFUSE_COPY,
  STAKE_WHISK_ID,
  canTapeStake,
  isListingStakeOverlay,
  parseStakeListingIds,
} from "@/lib/listing-stake";
import { listingStakePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type StakePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): StakeViewKind {
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
    return listing.id === STAKE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === STAKE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === STAKE_MUG_ID) {
    return "mug";
  }
  if (listing.id === STAKE_WHISK_ID) {
    return "whisk";
  }
  if (!canTapeStake(listing)) {
    return "owned";
  }
  return "physical";
}

function stakeSheetForId(id: string, stakeIds: string[]): StakeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isStake: listing ? isListingStakeOverlay(listing.id, stakeIds) : false,
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
}: StakePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const stakeIds = parseStakeListingIds(jar.get(STAKE_COOKIE_NAME)?.value);
  const sheet = stakeSheetForId(id, stakeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: STAKE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a stake note on.",
      path: listingStakePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: STAKE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a stake note."
          : sheet.kind === "mug"
            ? "A mug does not take a stake note. Stake is a pot-lid set."
            : sheet.kind === "whisk"
              ? "A whisk does not take a stake note. Stake is a pot-lid set."
              : sheet.kind === "chair"
                ? "A chair does not take a stake note. Stake is a pot-lid set."
                : sheet.kind === "owned"
                  ? "A stake note is for the pot lid. Another overlay already owns that listing."
                  : "A file does not take a stake note. A stake note is for the lid on the table.",
      path: listingStakePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not stake it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not stake it. Still a lid. Still no pot. Still tote. Not knurl. Not scribe. Not saucepan.`,
    path: listingStakePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingStakePage({ params }: StakePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const stakeIds = parseStakeListingIds(jar.get(STAKE_COOKIE_NAME)?.value);
  const sheet = stakeSheetForId(id, stakeIds);

  return <ListingStakeView sheet={sheet} stakeIds={stakeIds} />;
}
