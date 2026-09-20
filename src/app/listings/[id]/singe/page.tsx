import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSingeView,
  type SingeViewKind,
  type SingeViewSheet,
} from "@/components/listing-singe-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SINGE_CHAIR_ID,
  SINGE_COOKIE_NAME,
  SINGE_MUG_ID,
  SINGE_REFUSE_COPY,
  SINGE_SNEAKER_ID,
  canTapeSinge,
  isListingSingeOverlay,
  parseSingeListingIds,
} from "@/lib/listing-singe";
import { listingSingePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SingePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SingeViewKind {
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
    return listing.id === SINGE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === SINGE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === SINGE_SNEAKER_ID) {
    return "sneakers";
  }
  if (listing.id === SINGE_MUG_ID) {
    return "mug";
  }
  if (!canTapeSinge(listing)) {
    return "owned";
  }
  return "physical";
}

function singeSheetForId(id: string, singeIds: string[]): SingeViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSinge: listing ? isListingSingeOverlay(listing.id, singeIds) : false,
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
}: SingePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const singeIds = parseSingeListingIds(jar.get(SINGE_COOKIE_NAME)?.value);
  const sheet = singeSheetForId(id, singeIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SINGE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a singe note on.",
      path: listingSingePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SINGE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a singe note."
          : sheet.kind === "sneakers"
            ? "Split soles do not take a singe note. Singe is a jacket burn."
            : sheet.kind === "mug"
              ? "A diner mug does not take a singe note. Singe is a jacket burn."
              : sheet.kind === "chair"
                ? "A chair does not take a singe note. Singe is a jacket burn."
                : sheet.kind === "owned"
                  ? "A singe note is for the mint-green windbreaker. Another overlay already owns that listing."
                  : "A file does not take a singe note. A singe note is for the jacket on the table.",
      path: listingSingePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not singe it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not singe it. Still a jacket. Still a hole. Still tote. Not notch. Not nap. Not cream.`,
    path: listingSingePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSingePage({ params }: SingePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const singeIds = parseSingeListingIds(jar.get(SINGE_COOKIE_NAME)?.value);
  const sheet = singeSheetForId(id, singeIds);

  return <ListingSingeView sheet={sheet} singeIds={singeIds} />;
}
