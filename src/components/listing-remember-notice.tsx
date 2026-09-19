import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  REMEMBER_COOKIE_NAME,
  REMEMBER_NOTICE_TITLE,
  REMEMBER_PAGE_LINE,
  REMEMBER_STILL_LINE,
  REMEMBER_TABLE_LINE,
  REMEMBER_TOTE_LINE,
  REMEMBER_WRONG_LINE,
  isListingRememberOverlay,
  parseRememberListingIds,
} from "@/lib/listing-remember";
import { listingRememberPath } from "@/lib/paths";

/** PDP banner when this file stays the page we remember. Does not change the tote. */
export async function ListingRememberNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseRememberListingIds(jar.get(REMEMBER_COOKIE_NAME)?.value);

  if (!isListingRememberOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-remember-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={REMEMBER_TABLE_LINE}
        title={REMEMBER_NOTICE_TITLE}
        body={`${REMEMBER_PAGE_LINE} ${REMEMBER_WRONG_LINE} ${REMEMBER_STILL_LINE} ${REMEMBER_TOTE_LINE}`}
      >
        <Link
          href={listingRememberPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The remember card
        </Link>
      </MallNotice>
    </div>
  );
}
