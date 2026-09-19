import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingSpeakerView,
  type SpeakerViewKind,
  type SpeakerViewSheet,
} from "@/components/listing-speaker-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  SPEAKER_COOKIE_NAME,
  SPEAKER_REFUSE_COPY,
  isListingSpeakerOverlay,
  parseSpeakerListingIds,
} from "@/lib/listing-speaker";
import { listingSpeakerPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SpeakerPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): SpeakerViewKind {
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

function speakerSheetForId(id: string, speakerIds: string[]): SpeakerViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isSpeaker: listing ? isListingSpeakerOverlay(listing.id, speakerIds) : false,
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
}: SpeakerPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const speakerIds = parseSpeakerListingIds(jar.get(SPEAKER_COOKIE_NAME)?.value);
  const sheet = speakerSheetForId(id, speakerIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: SPEAKER_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a speaker note on.",
      path: listingSpeakerPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: SPEAKER_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a speaker note."
          : "A file does not take a speaker note. A speaker note is for a Game Boy on the table.",
      path: listingSpeakerPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not speaker it · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not speaker it. Still a line. Still fused. Still tote. Not line. Not a shop. Not glow. Not recap.`,
    path: listingSpeakerPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingSpeakerPage({ params }: SpeakerPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const speakerIds = parseSpeakerListingIds(jar.get(SPEAKER_COOKIE_NAME)?.value);
  const sheet = speakerSheetForId(id, speakerIds);

  return <ListingSpeakerView sheet={sheet} speakerIds={speakerIds} />;
}
