import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  TWIST_COOKIE_NAME,
  TWIST_CORD_LINE,
  TWIST_NOTICE_TITLE,
  TWIST_STILL_LINE,
  TWIST_TABLE_LINE,
  TWIST_TOTE_LINE,
  isListingTwistOverlay,
  parseTwistListingIds,
} from "@/lib/listing-twist";
import { listingTwistPath } from "@/lib/paths";

/** PDP banner when this SKU is taped twist-the-neck. Does not change the tote. */
export async function ListingTwistNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseTwistListingIds(jar.get(TWIST_COOKIE_NAME)?.value);

  if (!isListingTwistOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-twist-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={TWIST_TABLE_LINE}
        title={TWIST_NOTICE_TITLE}
        body={`${TWIST_CORD_LINE} ${TWIST_STILL_LINE} ${TWIST_TOTE_LINE}`}
      >
        <Link
          href={listingTwistPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The twist card
        </Link>
      </MallNotice>
    </div>
  );
}
