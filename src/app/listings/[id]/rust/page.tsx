import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingRustView,
  type RustViewKind,
  type RustViewSheet,
} from "@/components/listing-rust-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  RUST_COOKIE_NAME,
  RUST_REFUSE_COPY,
  isListingRustOverlay,
  parseRustListingIds,
} from "@/lib/listing-rust";
import { listingRustPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RustPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): RustViewKind {
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

function rustSheetForId(id: string, rustIds: string[]): RustViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isRust: listing ? isListingRustOverlay(listing.id, rustIds) : false,
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
}: RustPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const rustIds = parseRustListingIds(jar.get(RUST_COOKIE_NAME)?.value);
  const sheet = rustSheetForId(id, rustIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: RUST_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape rust paper on.",
      path: listingRustPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: RUST_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not rust."
          : "A recipe scan does not rust. Rust paper is for a whisk on the table.",
      path: listingRustPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `The rust stays · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Still metal. Still beats eggs. The rust stays. Still tote. Not a hardware shop.`,
    path: listingRustPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingRustPage({ params }: RustPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const rustIds = parseRustListingIds(jar.get(RUST_COOKIE_NAME)?.value);
  const sheet = rustSheetForId(id, rustIds);

  return <ListingRustView sheet={sheet} rustIds={rustIds} />;
}
