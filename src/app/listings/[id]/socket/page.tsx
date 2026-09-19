import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSocketView,
  type SocketViewKind,
  type SocketViewSheet,
} from "@/components/listing-socket-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SOCKET_COOKIE_NAME,
  SOCKET_REFUSE_COPY,
  isListingSocketOverlay,
  parseSocketListingIds,
} from "@/lib/listing-socket";
import { listingSocketPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SocketPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SocketViewKind {
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

function socketSheetForId(id: string, socketIds: string[]): SocketViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSocket: listing ? isListingSocketOverlay(listing.id, socketIds) : false,
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
}: SocketPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const socketIds = parseSocketListingIds(jar.get(SOCKET_COOKIE_NAME)?.value);
  const sheet = socketSheetForId(id, socketIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SOCKET_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a socket note on.",
      path: listingSocketPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SOCKET_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a socket note."
          : "A file does not take a socket note. A socket note is for a lamp on the table.",
      path: listingSocketPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not socket it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not socket it. Neck still twists. Still lights. Still tote. Not twist. Not a shop. Not shim.`,
    path: listingSocketPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSocketPage({ params }: SocketPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const socketIds = parseSocketListingIds(jar.get(SOCKET_COOKIE_NAME)?.value);
  const sheet = socketSheetForId(id, socketIds);

  return <ListingSocketView sheet={sheet} socketIds={socketIds} />;
}
