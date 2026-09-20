import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingTorqueView,
  type TorqueViewKind,
  type TorqueViewSheet,
} from "@/components/listing-torque-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  TORQUE_CHAIR_ID,
  TORQUE_COOKIE_NAME,
  TORQUE_JEWELS_ID,
  TORQUE_LP_ID,
  TORQUE_REFUSE_COPY,
  canTapeTorque,
  isListingTorqueOverlay,
  parseTorqueListingIds,
} from "@/lib/listing-torque";
import { listingTorquePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type TorquePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): TorqueViewKind {
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
    return listing.id === TORQUE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === TORQUE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === TORQUE_LP_ID) {
    return "lp";
  }
  if (listing.id === TORQUE_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeTorque(listing)) {
    return "owned";
  }
  return "physical";
}

function torqueSheetForId(id: string, torqueIds: string[]): TorqueViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isTorque: listing ? isListingTorqueOverlay(listing.id, torqueIds) : false,
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
}: TorquePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const torqueIds = parseTorqueListingIds(jar.get(TORQUE_COOKIE_NAME)?.value);
  const sheet = torqueSheetForId(id, torqueIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: TORQUE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a torque note on.",
      path: listingTorquePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: TORQUE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a torque note."
          : sheet.kind === "lp"
            ? "A record does not take a torque note. Torque is cassette capstan."
            : sheet.kind === "jewels"
              ? "Empty jewel cases do not take a torque note. Torque is cassette capstan."
              : sheet.kind === "chair"
                ? "A chair does not take a torque note. Torque is cassette capstan."
                : sheet.kind === "owned"
                  ? "A torque note is for SUMMER 93. Another overlay already owns that listing."
                  : "A file does not take a torque note. A torque note is for the cassette on the table.",
      path: listingTorquePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not torque it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not torque it. Still hiss. Still a radio edit. Still tote. Not flutter. Not bias. Not pinch.`,
    path: listingTorquePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingTorquePage({ params }: TorquePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const torqueIds = parseTorqueListingIds(jar.get(TORQUE_COOKIE_NAME)?.value);
  const sheet = torqueSheetForId(id, torqueIds);

  return <ListingTorqueView sheet={sheet} torqueIds={torqueIds} />;
}
