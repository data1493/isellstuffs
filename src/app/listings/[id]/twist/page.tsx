import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingTwistView,
  type TwistViewKind,
  type TwistViewSheet,
} from "@/components/listing-twist-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  TWIST_COOKIE_NAME,
  TWIST_REFUSE_COPY,
  isListingTwistOverlay,
  parseTwistListingIds,
} from "@/lib/listing-twist";
import { listingTwistPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type TwistPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): TwistViewKind {
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

function twistSheetForId(id: string, twistIds: string[]): TwistViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isTwist: listing ? isListingTwistOverlay(listing.id, twistIds) : false,
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
}: TwistPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const twistIds = parseTwistListingIds(jar.get(TWIST_COOKIE_NAME)?.value);
  const sheet = twistSheetForId(id, twistIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: TWIST_REFUSE_COPY,
      description: "No SKU with that id. Nothing to refuse a new switch on.",
      path: listingTwistPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: TWIST_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not twist."
          : "A PDF does not twist. Twist honesty is for a lamp on the table.",
      path: listingTwistPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `Twist the neck · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Twist the neck. I will not replace the switch. Still lights. Still for sale. Not crack. Not a hardware shop. Not cord.`,
    path: listingTwistPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingTwistPage({ params }: TwistPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const twistIds = parseTwistListingIds(jar.get(TWIST_COOKIE_NAME)?.value);
  const sheet = twistSheetForId(id, twistIds);

  return <ListingTwistView sheet={sheet} twistIds={twistIds} />;
}
