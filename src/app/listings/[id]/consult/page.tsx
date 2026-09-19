import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingConsultView,
  type ConsultViewKind,
  type ConsultViewSheet,
} from "@/components/listing-consult-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CONSULT_COOKIE_NAME,
  CONSULT_REFUSE_COPY,
  isListingConsultOverlay,
  parseConsultListingIds,
} from "@/lib/listing-consult";
import { listingConsultPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ConsultPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ConsultViewKind {
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

function consultSheetForId(id: string, consultIds: string[]): ConsultViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isConsult: listing ? isListingConsultOverlay(listing.id, consultIds) : false,
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
}: ConsultPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const consultIds = parseConsultListingIds(jar.get(CONSULT_COOKIE_NAME)?.value);
  const sheet = consultSheetForId(id, consultIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CONSULT_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a consult on.",
      path: listingConsultPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: CONSULT_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code is not a consult."
          : "A lamp is not a consult. Consult honesty is for a file on the digital lot.",
      path: listingConsultPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I don't consult · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. One page. Still a rule of thumb. Still tote. Not typeset. Not a desk. Not grid.`,
    path: listingConsultPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingConsultPage({ params }: ConsultPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const consultIds = parseConsultListingIds(jar.get(CONSULT_COOKIE_NAME)?.value);
  const sheet = consultSheetForId(id, consultIds);

  return <ListingConsultView sheet={sheet} consultIds={consultIds} />;
}
