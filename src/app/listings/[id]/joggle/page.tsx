import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingJoggleView,
  type JoggleViewKind,
  type JoggleViewSheet,
} from "@/components/listing-joggle-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  JOGGLE_COOKIE_NAME,
  JOGGLE_LID_ID,
  JOGGLE_MUG_ID,
  JOGGLE_REFUSE_COPY,
  canTapeJoggle,
  isListingJoggleOverlay,
  parseJoggleListingIds,
} from "@/lib/listing-joggle";
import { listingHubName } from "@/lib/listing-display";
import { listingJogglePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type JogglePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): JoggleViewKind {
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
  if (listing.id === JOGGLE_MUG_ID) {
    return "mug";
  }
  if (listing.id === JOGGLE_LID_ID) {
    return "lid";
  }
  if (!canTapeJoggle(listing)) {
    return "owned";
  }
  return "physical";
}

function joggleSheetForId(id: string, joggleIds: string[]): JoggleViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isJoggle: listing ? isListingJoggleOverlay(listing.id, joggleIds) : false,
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
}: JogglePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const joggleIds = parseJoggleListingIds(jar.get(JOGGLE_COOKIE_NAME)?.value);
  const sheet = joggleSheetForId(id, joggleIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: JOGGLE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a joggle note on.",
      path: listingJogglePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: JOGGLE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a joggle note."
          : sheet.kind === "mug"
            ? "A mug does not take a joggle note. Joggle is a whisk offset."
            : sheet.kind === "lid"
              ? "A lid does not take a joggle note. Joggle is a whisk offset."
              : sheet.kind === "owned"
                ? "A joggle note is for the balloon whisk. Another overlay already owns that listing."
                : "A file does not take a joggle note. A joggle note is for the whisk on the table.",
      path: listingJogglePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not joggle it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not joggle it. Still bent. Still metal. Still tote. Not quench. Not planish. Not braze. Not upset.`,
    path: listingJogglePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingJogglePage({ params }: JogglePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const joggleIds = parseJoggleListingIds(jar.get(JOGGLE_COOKIE_NAME)?.value);
  const sheet = joggleSheetForId(id, joggleIds);

  return <ListingJoggleView sheet={sheet} joggleIds={joggleIds} />;
}
