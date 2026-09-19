import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingRemoteView,
  type RemoteViewKind,
  type RemoteViewSheet,
} from "@/components/listing-remote-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  REMOTE_COOKIE_NAME,
  REMOTE_REFUSE_COPY,
  isListingRemoteOverlay,
  parseRemoteListingIds,
} from "@/lib/listing-remote";
import { listingRemotePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RemotePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): RemoteViewKind {
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

function remoteSheetForId(id: string, remoteIds: string[]): RemoteViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRemote: listing ? isListingRemoteOverlay(listing.id, remoteIds) : false,
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
}: RemotePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const remoteIds = parseRemoteListingIds(jar.get(REMOTE_COOKIE_NAME)?.value);
  const sheet = remoteSheetForId(id, remoteIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: REMOTE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a remote on.",
      path: listingRemotePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: REMOTE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a clicker."
          : "A file does not take a clicker. Remote honesty is for a living-room pile on the table.",
      path: listingRemotePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The remote walked · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Clicker is not in the box. Still tote. Not parts. Not van.`,
    path: listingRemotePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRemotePage({ params }: RemotePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const remoteIds = parseRemoteListingIds(jar.get(REMOTE_COOKIE_NAME)?.value);
  const sheet = remoteSheetForId(id, remoteIds);

  return <ListingRemoteView sheet={sheet} remoteIds={remoteIds} />;
}
