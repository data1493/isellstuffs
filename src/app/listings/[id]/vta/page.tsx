import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingVtaView,
  type VtaViewKind,
  type VtaViewSheet,
} from "@/components/listing-vta-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  VTA_CHAIR_ID,
  VTA_COOKIE_NAME,
  VTA_JEWELS_ID,
  VTA_MIXTAPE_ID,
  VTA_REFUSE_COPY,
  canTapeVta,
  isListingVtaOverlay,
  parseVtaListingIds,
} from "@/lib/listing-vta";
import { listingVtaPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type VtaPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): VtaViewKind {
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
    return listing.id === VTA_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === VTA_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === VTA_MIXTAPE_ID) {
    return "mixtape";
  }
  if (listing.id === VTA_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeVta(listing)) {
    return "owned";
  }
  return "physical";
}

function vtaSheetForId(id: string, vtaIds: string[]): VtaViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isVta: listing ? isListingVtaOverlay(listing.id, vtaIds) : false,
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
}: VtaPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const vtaIds = parseVtaListingIds(jar.get(VTA_COOKIE_NAME)?.value);
  const sheet = vtaSheetForId(id, vtaIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: VTA_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a vta note on.",
      path: listingVtaPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: VTA_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a vta note."
          : sheet.kind === "mixtape"
            ? "A mixtape does not take a vta note. Vta honesty is for the unnamed LP."
            : sheet.kind === "jewels"
              ? "Empty jewels do not take a vta note. Vta honesty is for the unnamed LP."
              : sheet.kind === "chair"
                ? "A chair does not take a vta note. Vta honesty is for the unnamed LP."
                : sheet.kind === "owned"
                  ? "A vta note is for the unnamed LP. Another overlay already owns that listing."
                  : "A file does not take a vta note. A vta note is for the LP on the table.",
      path: listingVtaPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not vta it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not vta it. Still a skip. Still unnamed. Still tote. Not riaa. Not vacuum. Not overhang.`,
    path: listingVtaPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingVtaPage({ params }: VtaPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const vtaIds = parseVtaListingIds(jar.get(VTA_COOKIE_NAME)?.value);
  const sheet = vtaSheetForId(id, vtaIds);

  return <ListingVtaView sheet={sheet} vtaIds={vtaIds} />;
}
