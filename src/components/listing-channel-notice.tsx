import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CHANNEL_COOKIE_NAME,
  CHANNEL_FLEX_LINE,
  CHANNEL_LACES_LINE,
  CHANNEL_NOTICE_TITLE,
  CHANNEL_STILL_LINE,
  CHANNEL_TABLE_LINE,
  CHANNEL_TOTE_LINE,
  isListingChannelOverlay,
  parseChannelListingIds,
} from "@/lib/listing-channel";
import { listingChannelPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-channel-them. Reads the cookie only. */
export async function ListingChannelNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseChannelListingIds(jar.get(CHANNEL_COOKIE_NAME)?.value);

  if (!isListingChannelOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-channel-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={CHANNEL_TABLE_LINE}
        title={CHANNEL_NOTICE_TITLE}
        body={`${CHANNEL_FLEX_LINE} ${CHANNEL_LACES_LINE} ${CHANNEL_STILL_LINE} ${CHANNEL_TOTE_LINE}`}
      >
        <Link
          href={listingChannelPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The channel card
        </Link>
      </MallNotice>
    </div>
  );
}
