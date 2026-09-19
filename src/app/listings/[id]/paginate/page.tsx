import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPaginateView,
  type PaginateViewKind,
  type PaginateViewSheet,
} from "@/components/listing-paginate-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  PAGINATE_COOKIE_NAME,
  PAGINATE_REFUSE_COPY,
  isListingPaginateOverlay,
  parsePaginateListingIds,
} from "@/lib/listing-paginate";
import { listingPaginatePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PaginatePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PaginateViewKind {
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

function paginateSheetForId(
  id: string,
  paginateIds: string[],
): PaginateViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPaginate: listing
      ? isListingPaginateOverlay(listing.id, paginateIds)
      : false,
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
}: PaginatePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const paginateIds = parsePaginateListingIds(
    jar.get(PAGINATE_COOKIE_NAME)?.value,
  );
  const sheet = paginateSheetForId(id, paginateIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PAGINATE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a paginate note on.",
      path: listingPaginatePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: PAGINATE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a paginate note."
          : "A lamp does not take a paginate note. A paginate note is for one junk PDF page.",
      path: listingPaginatePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not paginate it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not paginate it. Still one page. Still a rule of thumb. Still tote. Not typeset. Not revise. Not a sheet desk.`,
    path: listingPaginatePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPaginatePage({
  params,
}: PaginatePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const paginateIds = parsePaginateListingIds(
    jar.get(PAGINATE_COOKIE_NAME)?.value,
  );
  const sheet = paginateSheetForId(id, paginateIds);

  return <ListingPaginateView sheet={sheet} paginateIds={paginateIds} />;
}
