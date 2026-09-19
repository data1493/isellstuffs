import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BOLD_ALMOST_LINE,
  BOLD_COOKIE_NAME,
  BOLD_NOTICE_TITLE,
  BOLD_STILL_LINE,
  BOLD_TABLE_LINE,
  BOLD_TOTE_LINE,
  BOLD_WEIGHTS_LINE,
  isListingBoldOverlay,
  parseBoldListingIds,
} from "@/lib/listing-bold";
import { listingBoldPath } from "@/lib/paths";

/** PDP banner when this file stays two weights. Does not change the tote. */
export async function ListingBoldNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseBoldListingIds(jar.get(BOLD_COOKIE_NAME)?.value);

  if (!isListingBoldOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-bold-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BOLD_TABLE_LINE}
        title={BOLD_NOTICE_TITLE}
        body={`${BOLD_WEIGHTS_LINE} ${BOLD_ALMOST_LINE} ${BOLD_STILL_LINE} ${BOLD_TOTE_LINE}`}
      >
        <Link
          href={listingBoldPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The bold card
        </Link>
      </MallNotice>
    </div>
  );
}
