import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingDamView,
  type DamViewKind,
  type DamViewSheet,
} from "@/components/listing-dam-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  DAM_COOKIE_NAME,
  DAM_DRAWER_ID,
  DAM_LID_ID,
  DAM_REFUSE_COPY,
  canTapeDam,
  isListingDamOverlay,
  parseDamListingIds,
} from "@/lib/listing-dam";
import { listingDamPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DamPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): DamViewKind {
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
  if (listing.id === DAM_DRAWER_ID) {
    return "drawer";
  }
  if (listing.id === DAM_LID_ID) {
    return "lid";
  }
  if (!canTapeDam(listing)) {
    return "owned";
  }
  return "physical";
}

function damSheetForId(id: string, damIds: string[]): DamViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isDam: listing ? isListingDamOverlay(listing.id, damIds) : false,
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
}: DamPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const damIds = parseDamListingIds(jar.get(DAM_COOKIE_NAME)?.value);
  const sheet = damSheetForId(id, damIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: DAM_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a dam note on.",
      path: listingDamPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: DAM_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a dam note."
          : sheet.kind === "drawer"
            ? "A cable drawer does not take a dam note. Dam is a Game Boy wall."
            : sheet.kind === "lid"
              ? "A pot lid does not take a dam note. Dam is a Game Boy wall."
              : sheet.kind === "owned"
                ? "A dam note is for the cracked Game Boy. Another overlay already owns that listing."
                : "A file does not take a dam note. A dam note is for the Game Boy on the table.",
      path: listingDamPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not dam it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not dam it. Still a crack. Still Tetris. Still tote. Not globtop. Not acf. Not underfill.`,
    path: listingDamPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingDamPage({ params }: DamPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const damIds = parseDamListingIds(jar.get(DAM_COOKIE_NAME)?.value);
  const sheet = damSheetForId(id, damIds);

  return <ListingDamView sheet={sheet} damIds={damIds} />;
}
