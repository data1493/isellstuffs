import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingGateView,
  type GateViewKind,
  type GateViewSheet,
} from "@/components/listing-gate-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  GATE_COOKIE_NAME,
  GATE_REFUSE_COPY,
  isListingGateOverlay,
  parseGateListingIds,
} from "@/lib/listing-gate";
import { listingGatePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type GatePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): GateViewKind {
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

function gateSheetForId(id: string, gateIds: string[]): GateViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isGate: listing ? isListingGateOverlay(listing.id, gateIds) : false,
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
}: GatePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const gateIds = parseGateListingIds(jar.get(GATE_COOKIE_NAME)?.value);
  const sheet = gateSheetForId(id, gateIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: GATE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a gate note on.",
      path: listingGatePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: GATE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a gate note."
          : "A lamp does not take a gate note. A gate note is for twelve shots and a loop.",
      path: listingGatePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not gate it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not gate it. Still twelve shots. Still a loop. Still tote. Not stems. Not tune. Not a loop desk.`,
    path: listingGatePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingGatePage({ params }: GatePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const gateIds = parseGateListingIds(jar.get(GATE_COOKIE_NAME)?.value);
  const sheet = gateSheetForId(id, gateIds);

  return <ListingGateView sheet={sheet} gateIds={gateIds} />;
}
