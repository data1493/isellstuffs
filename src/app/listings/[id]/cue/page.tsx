import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingCueView,
  type CueViewKind,
  type CueViewSheet,
} from "@/components/listing-cue-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import {
  CUE_BOY_ID,
  CUE_CHAIR_ID,
  CUE_COOKIE_NAME,
  CUE_JEWELS_ID,
  CUE_PACK_ID,
  CUE_REFUSE_COPY,
  canTapeCue,
  isListingCueOverlay,
  parseCueListingIds,
} from "@/lib/listing-cue";
import { listingHubName } from "@/lib/listing-display";
import { listingCuePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CuePageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): CueViewKind {
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
    return listing.id === CUE_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === CUE_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === CUE_PACK_ID) {
    return "pack";
  }
  if (listing.id === CUE_BOY_ID) {
    return "boy";
  }
  if (listing.id === CUE_JEWELS_ID) {
    return "jewels";
  }
  if (!canTapeCue(listing)) {
    return "owned";
  }
  return "physical";
}

function cueSheetForId(id: string, cueIds: string[]): CueViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isCue: listing ? isListingCueOverlay(listing.id, cueIds) : false,
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
}: CuePageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const cueIds = parseCueListingIds(jar.get(CUE_COOKIE_NAME)?.value);
  const sheet = cueSheetForId(id, cueIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CUE_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a cue note on.",
      path: listingCuePath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: CUE_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a cue note."
          : sheet.kind === "pack"
            ? "A sample pack does not take a cue note. Cue honesty is for the burned disc."
            : sheet.kind === "boy"
              ? "A Game Boy does not take a cue note. Cue honesty is for the burned disc."
              : sheet.kind === "jewels"
                ? "Empty jewel cases do not take a cue note. Cue honesty is for the burned disc."
                : sheet.kind === "chair"
                  ? "A chair does not take a cue note. Cue honesty is for the burned disc."
                  : sheet.kind === "owned"
                    ? "A cue note is for the burned CD-R. Another overlay already owns that listing."
                    : "A file does not take a cue note. A cue note is for the burned disc on the table.",
      path: listingCuePath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not cue it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not cue it. Still a Sharpie. Still a skip. Still tote. Not finalize. Not overburn. Not encode.`,
    path: listingCuePath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingCuePage({ params }: CuePageProps) {
  const { id } = await params;
  const jar = await cookies();
  const cueIds = parseCueListingIds(jar.get(CUE_COOKIE_NAME)?.value);
  const sheet = cueSheetForId(id, cueIds);

  return <ListingCueView sheet={sheet} cueIds={cueIds} />;
}
