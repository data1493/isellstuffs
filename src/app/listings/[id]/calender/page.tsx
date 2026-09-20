import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCalenderView,
  type CalenderViewKind,
  type CalenderViewSheet,
} from "@/components/listing-calender-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  CALENDER_CHAIR_ID,
  CALENDER_COOKIE_NAME,
  CALENDER_REFUSE_COPY,
  CALENDER_SNEAKER_ID,
  canTapeCalender,
  isListingCalenderOverlay,
  parseCalenderListingIds,
} from "@/lib/listing-calender";
import { listingHubName } from "@/lib/listing-display";
import { listingCalenderPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CalenderPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CalenderViewKind {
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
    return listing.id === CALENDER_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === CALENDER_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === CALENDER_SNEAKER_ID) {
    return "sneakers";
  }
  if (!canTapeCalender(listing)) {
    return "owned";
  }
  return "physical";
}

function calenderSheetForId(
  id: string,
  calenderIds: string[],
): CalenderViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCalender: listing
      ? isListingCalenderOverlay(listing.id, calenderIds)
      : false,
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
}: CalenderPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const calenderIds = parseCalenderListingIds(
    jar.get(CALENDER_COOKIE_NAME)?.value,
  );
  const sheet = calenderSheetForId(id, calenderIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CALENDER_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a calender note on.",
      path: listingCalenderPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: CALENDER_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a calender note."
          : sheet.kind === "sneakers"
            ? "Sneakers do not take a calender note. Calender honesty is for the windbreaker."
            : sheet.kind === "chair"
              ? "A chair does not take a calender note. Calender honesty is for the windbreaker."
              : sheet.kind === "owned"
                ? "A calender note is for the windbreaker. Another overlay already owns that listing."
                : "A file does not take a calender note. A calender note is for the jacket on the table.",
      path: listingCalenderPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not calender it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not calender it. Still mint-green. Still smells like a car. Still tote. Not singe. Not nap. Not notch.`,
    path: listingCalenderPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCalenderPage({
  params,
}: CalenderPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const calenderIds = parseCalenderListingIds(
    jar.get(CALENDER_COOKIE_NAME)?.value,
  );
  const sheet = calenderSheetForId(id, calenderIds);

  return <ListingCalenderView sheet={sheet} calenderIds={calenderIds} />;
}
