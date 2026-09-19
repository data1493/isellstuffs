import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingProfileView,
  type ProfileViewKind,
  type ProfileViewSheet,
} from "@/components/listing-profile-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  PROFILE_COOKIE_NAME,
  PROFILE_REFUSE_COPY,
  isListingProfileOverlay,
  parseProfileListingIds,
} from "@/lib/listing-profile";
import { listingProfilePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ProfileViewKind {
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

function profileSheetForId(id: string, profileIds: string[]): ProfileViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isProfile: listing ? isListingProfileOverlay(listing.id, profileIds) : false,
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
}: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const profileIds = parseProfileListingIds(jar.get(PROFILE_COOKIE_NAME)?.value);
  const sheet = profileSheetForId(id, profileIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: PROFILE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a profile note on.",
      path: listingProfilePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: PROFILE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a camera profile."
          : "A lamp is not a camera profile. Profile honesty is for a file on the digital lot.",
      path: listingProfilePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not profile it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not profile it. Three looks. Still parking-lot. Still tote. Not convert. Not a grade shop. Not log.`,
    path: listingProfilePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const profileIds = parseProfileListingIds(jar.get(PROFILE_COOKIE_NAME)?.value);
  const sheet = profileSheetForId(id, profileIds);

  return <ListingProfileView sheet={sheet} profileIds={profileIds} />;
}
