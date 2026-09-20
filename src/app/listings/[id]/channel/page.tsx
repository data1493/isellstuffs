import type { Metadata } from "next";
import { cookies } from "next/headers";

import {
  ListingChannelView,
  type ChannelViewKind,
  type ChannelViewSheet,
} from "@/components/listing-channel-view";
import {
  formatMoney,
  isGiftListing,
  isPhysicalListing,
  listingById,
  stallById,
} from "@/lib/commerce";
import { listingHubName } from "@/lib/listing-display";
import {
  CHANNEL_CHAIR_ID,
  CHANNEL_COOKIE_NAME,
  CHANNEL_JACKET_ID,
  CHANNEL_LID_ID,
  CHANNEL_REFUSE_COPY,
  canTapeChannel,
  isListingChannelOverlay,
  parseChannelListingIds,
} from "@/lib/listing-channel";
import { listingChannelPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ChannelPageProps = {
  params: Promise<{ id: string }>;
};

function sheetKind(listing: ReturnType<typeof listingById>): ChannelViewKind {
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
    return listing.id === CHANNEL_CHAIR_ID ? "chair" : "sold";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.id === CHANNEL_CHAIR_ID) {
    return "chair";
  }
  if (listing.id === CHANNEL_JACKET_ID) {
    return "jacket";
  }
  if (listing.id === CHANNEL_LID_ID) {
    return "lid";
  }
  if (!canTapeChannel(listing)) {
    return "owned";
  }
  return "physical";
}

function channelSheetForId(id: string, channelIds: string[]): ChannelViewSheet {
  const listing = listingById(id);
  const kind = sheetKind(listing);
  const stall = listing ? stallById(listing.stallId) : undefined;

  return {
    kind,
    listingId: listing?.id ?? id,
    isChannel: listing ? isListingChannelOverlay(listing.id, channelIds) : false,
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
}: ChannelPageProps): Promise<Metadata> {
  const { id } = await params;
  const jar = await cookies();
  const channelIds = parseChannelListingIds(jar.get(CHANNEL_COOKIE_NAME)?.value);
  const sheet = channelSheetForId(id, channelIds);

  if (sheet.kind === "missing") {
    return shareMetadata({
      title: CHANNEL_REFUSE_COPY,
      description: "No SKU with that id. Nothing to tape a channel note on.",
      path: listingChannelPath(id),
      robots: { index: false, follow: false },
    });
  }

  if (sheet.kind !== "physical") {
    return shareMetadata({
      title: CHANNEL_REFUSE_COPY,
      description:
        sheet.kind === "gift"
          ? "The gift card is at the desk. A code does not take a channel note."
          : sheet.kind === "jacket"
            ? "A jacket does not take a channel note. Channel is a pair welt cut."
            : sheet.kind === "lid"
              ? "A pot lid does not take a channel note. Channel is a pair welt cut."
              : sheet.kind === "chair"
                ? "A chair does not take a channel note. Channel is a pair welt cut."
                : sheet.kind === "owned"
                  ? "A channel note is for the split-sole pair. Another overlay already owns that listing."
                  : "A file does not take a channel note. A channel note is for the pair on the table.",
      path: listingChannelPath(id),
      robots: { index: false, follow: false },
    });
  }

  return shareMetadata({
    title: `I will not channel them · ${sheet.title}`,
    description: `${sheet.priceLabel} at ${sheet.stallName}. I will not channel them. Still a flex. Still original laces. Still tote. Not shank. Not edge. Not welt.`,
    path: listingChannelPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function ListingChannelPage({ params }: ChannelPageProps) {
  const { id } = await params;
  const jar = await cookies();
  const channelIds = parseChannelListingIds(jar.get(CHANNEL_COOKIE_NAME)?.value);
  const sheet = channelSheetForId(id, channelIds);

  return <ListingChannelView sheet={sheet} channelIds={channelIds} />;
}
