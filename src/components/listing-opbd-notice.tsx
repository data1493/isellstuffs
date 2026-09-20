import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  OPBD_BOLD_LINE,
  OPBD_COOKIE_NAME,
  OPBD_NOTICE_TITLE,
  OPBD_STILL_LINE,
  OPBD_TABLE_LINE,
  OPBD_TOTE_LINE,
  OPBD_WEIGHTS_LINE,
  isListingOpbdOverlay,
  parseOpbdListingIds,
} from "@/lib/listing-opbd";
import { listingOpbdPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-opbd-it. Reads the cookie only. */
export async function ListingOpbdNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseOpbdListingIds(jar.get(OPBD_COOKIE_NAME)?.value);

  if (!isListingOpbdOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-opbd-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={OPBD_TABLE_LINE}
        title={OPBD_NOTICE_TITLE}
        body={`${OPBD_WEIGHTS_LINE} ${OPBD_BOLD_LINE} ${OPBD_STILL_LINE} ${OPBD_TOTE_LINE}`}
      >
        <Link
          href={listingOpbdPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The opbd card
        </Link>
      </MallNotice>
    </div>
  );
}
