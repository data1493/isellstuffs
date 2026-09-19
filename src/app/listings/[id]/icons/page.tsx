import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingIconsView,
  type IconsViewKind,
  type IconsViewSheet,
} from "@/components/listing-icons-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  ICONS_COOKIE_NAME,
  ICONS_REFUSE_COPY,
  isListingIconsOverlay,
  parseIconsListingIds,
} from "@/lib/listing-icons";
import { listingIconsPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type IconsPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): IconsViewKind {
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

function iconsSheetForId(id: string, iconsIds: string[]): IconsViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isIcons: listing ? isListingIconsOverlay(listing.id, iconsIds) : false,
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
}: IconsPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const iconsIds = parseIconsListingIds(jar.get(ICONS_COOKIE_NAME)?.value);
  const sheet = iconsSheetForId(id, iconsIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: ICONS_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape an icons note on.",
      path: listingIconsPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: ICONS_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not an icons note."
          : "A CD-R is not a pictogram. Icons honesty is for a file on the digital lot.",
      path: listingIconsPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not draw the icons · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Two weights. Walkers still want the restrooms glyph. Still tote. Not a sign shop.`,
    path: listingIconsPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingIconsPage({ params }: IconsPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const iconsIds = parseIconsListingIds(jar.get(ICONS_COOKIE_NAME)?.value);
  const sheet = iconsSheetForId(id, iconsIds);

  return <ListingIconsView sheet={sheet} iconsIds={iconsIds} />;
}
