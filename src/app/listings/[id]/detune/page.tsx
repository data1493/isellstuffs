import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingDetuneView,
  type DetuneViewKind,
  type DetuneViewSheet,
} from "@/components/listing-detune-view";
import {
  formatMoney,
  isDigitalListing,
  isGiftListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  DETUNE_COOKIE_NAME,
  DETUNE_FONT_ID,
  DETUNE_HOST_ID,
  DETUNE_LUT_ID,
  DETUNE_REFUSE_COPY,
  canTapeDetune,
  isListingDetuneOverlay,
  parseDetuneListingIds,
} from "@/lib/listing-detune";
import { listingDetunePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type DetunePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): DetuneViewKind {
  if (!listing) {
    return "missing";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (listing.id === DETUNE_FONT_ID) {
    return "font";
  }
  if (listing.id === DETUNE_LUT_ID) {
    return "lut";
  }
  if (isDigitalListing(listing)) {
    if (listing.status === "file-gone") {
      return "file-gone";
    }
    if (listing.id !== DETUNE_HOST_ID || !canTapeDetune(listing)) {
      return "owned";
    }
    return "digital";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  return "physical";
}

function detuneSheetForId(id: string, detuneIds: string[]): DetuneViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isDetune: listing ? isListingDetuneOverlay(listing.id, detuneIds) : false,
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
}: DetunePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const detuneIds = parseDetuneListingIds(jar.get(DETUNE_COOKIE_NAME)?.value);
  const sheet = detuneSheetForId(id, detuneIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: DETUNE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a detune note on.",
      path: listingDetunePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "digital") {
    return shareMetadata({
      title: DETUNE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a detune note."
          : sheet.kind === "font"
            ? "A booth font does not take a detune note. Detune is slip the shots."
            : sheet.kind === "lut"
              ? "A LUT pack does not take a detune note. Detune is slip the shots."
              : sheet.kind === "owned"
                ? "A detune note is for the four-dollar sample pack. Another overlay already owns that listing."
                : "A Game Boy does not take a detune note. A detune note is for twelve shots and four dollars.",
      path: listingDetunePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not detune them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not detune them. Still slaps. Still four dollars. Still tote. Not saturate. Not quantize. Not a shop. Not resample. Not an account.`,
    path: listingDetunePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingDetunePage({ params }: DetunePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const detuneIds = parseDetuneListingIds(jar.get(DETUNE_COOKIE_NAME)?.value);
  const sheet = detuneSheetForId(id, detuneIds);

  return <ListingDetuneView sheet={sheet} detuneIds={detuneIds} />;
}
