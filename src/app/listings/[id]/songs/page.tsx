import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSongsView,
  type SongsViewKind,
  type SongsViewSheet,
} from "@/components/listing-songs-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SONGS_COOKIE_NAME,
  SONGS_REFUSE_COPY,
  isListingSongsOverlay,
  parseSongsListingIds,
} from "@/lib/listing-songs";
import { listingSongsPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SongsPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SongsViewKind {
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

function songsSheetForId(id: string, songsIds: string[]): SongsViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSongs: listing ? isListingSongsOverlay(listing.id, songsIds) : false,
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
}: SongsPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const songsIds = parseSongsListingIds(jar.get(SONGS_COOKIE_NAME)?.value);
  const sheet = songsSheetForId(id, songsIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SONGS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to leave untitled.",
      path: listingSongsPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SONGS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code already has a title."
          : "A file already has a title. Untitled-songs honesty is for a cassette on the table.",
      path: listingSongsPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not title the songs · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Hiss is the tape hiss. Scan is paper to a file. This is the mixtape with no titles. Still tote. Not hiss. Not scan.`,
    path: listingSongsPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSongsPage({ params }: SongsPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const songsIds = parseSongsListingIds(jar.get(SONGS_COOKIE_NAME)?.value);
  const sheet = songsSheetForId(id, songsIds);

  return <ListingSongsView sheet={sheet} songsIds={songsIds} />;
}
