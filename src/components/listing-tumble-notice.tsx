import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  TUMBLE_COOKIE_NAME,
  TUMBLE_CRACK_LINE,
  TUMBLE_EMPTY_CASES_LINE,
  TUMBLE_NOTICE_TITLE,
  TUMBLE_STILL_LINE,
  TUMBLE_TABLE_LINE,
  TUMBLE_TOTE_LINE,
  isListingTumbleOverlay,
  parseTumbleListingIds,
} from "@/lib/listing-tumble";
import { listingTumblePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-tumble-them. Reads the cookie only. */
export async function ListingTumbleNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseTumbleListingIds(jar.get(TUMBLE_COOKIE_NAME)?.value);

  if (!isListingTumbleOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-tumble-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={TUMBLE_TABLE_LINE}
        title={TUMBLE_NOTICE_TITLE}
        body={`${TUMBLE_EMPTY_CASES_LINE} ${TUMBLE_CRACK_LINE} ${TUMBLE_STILL_LINE} ${TUMBLE_TOTE_LINE}`}
      >
        <Link
          href={listingTumblePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The tumble card
        </Link>
      </MallNotice>
    </div>
  );
}
