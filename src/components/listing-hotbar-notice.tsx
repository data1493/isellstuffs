import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  HOTBAR_COOKIE_NAME,
  HOTBAR_CRACK_LINE,
  HOTBAR_NOTICE_TITLE,
  HOTBAR_STILL_LINE,
  HOTBAR_TABLE_LINE,
  HOTBAR_TETRIS_LINE,
  HOTBAR_TOTE_LINE,
  isListingHotbarOverlay,
  parseHotbarListingIds,
} from "@/lib/listing-hotbar";
import { listingHotbarPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-hotbar-it. Reads the cookie only. */
export async function ListingHotbarNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseHotbarListingIds(jar.get(HOTBAR_COOKIE_NAME)?.value);

  if (!isListingHotbarOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-hotbar-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={HOTBAR_TABLE_LINE}
        title={HOTBAR_NOTICE_TITLE}
        body={`${HOTBAR_CRACK_LINE} ${HOTBAR_TETRIS_LINE} ${HOTBAR_STILL_LINE} ${HOTBAR_TOTE_LINE}`}
      >
        <Link
          href={listingHotbarPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The hotbar card
        </Link>
      </MallNotice>
    </div>
  );
}
