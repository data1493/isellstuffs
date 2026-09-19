import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  INSIDE_ARRIVED_LINE,
  INSIDE_COOKIE_NAME,
  INSIDE_NOTICE_TITLE,
  INSIDE_STILL_LINE,
  INSIDE_TABLE_LINE,
  INSIDE_TOTE_LINE,
  isListingInsideOverlay,
  parseInsideListingIds,
} from "@/lib/listing-inside";
import { listingInsidePath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-say-what-was-inside. Does not change the tote. */
export async function ListingInsideNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseInsideListingIds(jar.get(INSIDE_COOKIE_NAME)?.value);

  if (!isListingInsideOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-inside-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={INSIDE_TABLE_LINE}
        title={INSIDE_NOTICE_TITLE}
        body={`${INSIDE_ARRIVED_LINE} ${INSIDE_STILL_LINE} ${INSIDE_TOTE_LINE}`}
      >
        <Link
          href={listingInsidePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The inside card
        </Link>
      </MallNotice>
    </div>
  );
}
