import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingPhoneView,
  type PhoneViewKind,
  type PhoneViewSheet,
} from "@/components/listing-phone-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  PHONE_COOKIE_NAME,
  PHONE_REFUSE_COPY,
  isListingPhoneOverlay,
  parsePhoneListingIds,
} from "@/lib/listing-phone";
import { listingPhonePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PhonePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): PhoneViewKind {
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

function phoneSheetForId(id: string, phoneIds: string[]): PhoneViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isPhone: listing ? isListingPhoneOverlay(listing.id, phoneIds) : false,
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
}: PhonePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const phoneIds = parsePhoneListingIds(jar.get(PHONE_COOKIE_NAME)?.value);
  const sheet = phoneSheetForId(id, phoneIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PHONE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a phone note on.",
      path: listingPhonePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: PHONE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not charge a phone."
          : "A file is not a cable drawer. A phone note is for a tangle on the table.",
      path: listingPhonePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I don't know the phone · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. Parts is sold as a tangle. Pile is won't split. Van is more in the van. This is the phone note. Some ends look honest. Still tote. Not parts. Not a phone counter.`,
    path: listingPhonePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingPhonePage({ params }: PhonePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const phoneIds = parsePhoneListingIds(jar.get(PHONE_COOKIE_NAME)?.value);
  const sheet = phoneSheetForId(id, phoneIds);

  return <ListingPhoneView sheet={sheet} phoneIds={phoneIds} />;
}
