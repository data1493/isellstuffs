import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBookView,
  type BookViewKind,
  type BookViewSheet,
} from "@/components/listing-book-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  BOOK_COOKIE_NAME,
  BOOK_REFUSE_COPY,
  isListingBookOverlay,
  parseBookListingIds,
} from "@/lib/listing-book";
import { listingBookPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BookPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BookViewKind {
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

function bookSheetForId(id: string, bookIds: string[]): BookViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBook: listing ? isListingBookOverlay(listing.id, bookIds) : false,
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
}: BookPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const bookIds = parseBookListingIds(jar.get(BOOK_COOKIE_NAME)?.value);
  const sheet = bookSheetForId(id, bookIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BOOK_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a booklet on.",
      path: listingBookPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: BOOK_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a booklet."
          : "A file does not take a booklet. The liner notes walked from a jewel.",
      path: listingBookPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The booklet walked · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Liner notes are not in the jewel. Cases is the empty jewel. Scan is paper to a file. Still tote. Not cases. Not scan.`,
    path: listingBookPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBookPage({ params }: BookPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const bookIds = parseBookListingIds(jar.get(BOOK_COOKIE_NAME)?.value);
  const sheet = bookSheetForId(id, bookIds);

  return <ListingBookView sheet={sheet} bookIds={bookIds} />;
}
