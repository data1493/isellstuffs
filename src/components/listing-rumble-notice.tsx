import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  RUMBLE_COOKIE_NAME,
  RUMBLE_NOTICE_TITLE,
  RUMBLE_SKIP_LINE,
  RUMBLE_STILL_LINE,
  RUMBLE_TABLE_LINE,
  RUMBLE_TOTE_LINE,
  RUMBLE_UNNAMED_LINE,
  isListingRumbleOverlay,
  parseRumbleListingIds,
} from "@/lib/listing-rumble";
import { listingRumblePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-rumble-it. Reads the cookie only. */
export async function ListingRumbleNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseRumbleListingIds(jar.get(RUMBLE_COOKIE_NAME)?.value);

  if (!isListingRumbleOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-rumble-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={RUMBLE_TABLE_LINE}
        title={RUMBLE_NOTICE_TITLE}
        body={`${RUMBLE_UNNAMED_LINE} ${RUMBLE_SKIP_LINE} ${RUMBLE_STILL_LINE} ${RUMBLE_TOTE_LINE}`}
      >
        <Link
          href={listingRumblePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The rumble card
        </Link>
      </MallNotice>
    </div>
  );
}
