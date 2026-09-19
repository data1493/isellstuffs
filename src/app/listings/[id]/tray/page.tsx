import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingTrayView,
  type TrayViewKind,
  type TrayViewSheet,
} from "@/components/listing-tray-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  TRAY_COOKIE_NAME,
  TRAY_REFUSE_COPY,
  isListingTrayOverlay,
  parseTrayListingIds,
} from "@/lib/listing-tray";
import { listingTrayPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type TrayPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): TrayViewKind {
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

function traySheetForId(id: string, trayIds: string[]): TrayViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isTray: listing ? isListingTrayOverlay(listing.id, trayIds) : false,
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
}: TrayPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const trayIds = parseTrayListingIds(jar.get(TRAY_COOKIE_NAME)?.value);
  const sheet = traySheetForId(id, trayIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: TRAY_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a tray note on.",
      path: listingTrayPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: TRAY_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a tray note."
          : "A file does not take a tray note. A tray note is for a jewel on the table.",
      path: listingTrayPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not tray it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not tray it. This case. Still spins. Still tote. Still for sale.`,
    path: listingTrayPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingTrayPage({ params }: TrayPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const trayIds = parseTrayListingIds(jar.get(TRAY_COOKIE_NAME)?.value);
  const sheet = traySheetForId(id, trayIds);

  return <ListingTrayView sheet={sheet} trayIds={trayIds} />;
}
