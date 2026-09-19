import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  REVISE_COOKIE_NAME,
  REVISE_NOTICE_TITLE,
  REVISE_ONE_LINE,
  REVISE_PAGE_LINE,
  REVISE_STILL_LINE,
  REVISE_TABLE_LINE,
  REVISE_TOTE_LINE,
  isListingReviseOverlay,
  parseReviseListingIds,
} from "@/lib/listing-revise";
import { listingRevisePath } from "@/lib/paths";

/** PDP banner when this file stays one page. Does not change the tote. */
export async function ListingReviseNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseReviseListingIds(jar.get(REVISE_COOKIE_NAME)?.value);

  if (!isListingReviseOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-revise-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={REVISE_TABLE_LINE}
        title={REVISE_NOTICE_TITLE}
        body={`${REVISE_PAGE_LINE} ${REVISE_ONE_LINE} ${REVISE_STILL_LINE} ${REVISE_TOTE_LINE}`}
      >
        <Link
          href={listingRevisePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The revise card
        </Link>
      </MallNotice>
    </div>
  );
}
