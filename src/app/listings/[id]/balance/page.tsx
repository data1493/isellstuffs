import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingBalanceView,
  type BalanceViewKind,
  type BalanceViewSheet,
} from "@/components/listing-balance-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  BALANCE_COOKIE_NAME,
  BALANCE_REFUSE_COPY,
  isListingBalanceOverlay,
  parseBalanceListingIds,
} from "@/lib/listing-balance";
import { listingBalancePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type BalancePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): BalanceViewKind {
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

function balanceSheetForId(id: string, balanceIds: string[]): BalanceViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isBalance: listing ? isListingBalanceOverlay(listing.id, balanceIds) : false,
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
}: BalancePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const balanceIds = parseBalanceListingIds(jar.get(BALANCE_COOKIE_NAME)?.value);
  const sheet = balanceSheetForId(id, balanceIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: BALANCE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a balance note on.",
      path: listingBalancePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: BALANCE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a LUT look."
          : "A lamp is not a LUT look. Balance honesty is for a file on the digital lot.",
      path: listingBalancePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not balance it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not balance it. Three looks. Tungsten. Warm stays warm. Convert is Rec.709. Grade is no custom LUT. Still tote.`,
    path: listingBalancePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingBalancePage({ params }: BalancePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const balanceIds = parseBalanceListingIds(jar.get(BALANCE_COOKIE_NAME)?.value);
  const sheet = balanceSheetForId(id, balanceIds);

  return <ListingBalanceView sheet={sheet} balanceIds={balanceIds} />;
}
