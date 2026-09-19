import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  DONGLE_COOKIE_NAME,
  DONGLE_NOTICE_TITLE,
  DONGLE_SOLD_LINE,
  DONGLE_STILL_LINE,
  DONGLE_TABLE_LINE,
  DONGLE_TOTE_LINE,
  isListingDongleOverlay,
  parseDongleListingIds,
} from "@/lib/listing-dongle";
import { listingDonglePath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-don't-have-a-dongle. Does not change the tote. */
export async function ListingDongleNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseDongleListingIds(jar.get(DONGLE_COOKIE_NAME)?.value);

  if (!isListingDongleOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-dongle-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={DONGLE_TABLE_LINE}
        title={DONGLE_NOTICE_TITLE}
        body={`${DONGLE_SOLD_LINE} ${DONGLE_STILL_LINE} ${DONGLE_TOTE_LINE}`}
      >
        <Link
          href={listingDonglePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The dongle card
        </Link>
      </MallNotice>
    </div>
  );
}
