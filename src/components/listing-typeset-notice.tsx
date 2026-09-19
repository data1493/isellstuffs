import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  TYPESET_COOKIE_NAME,
  TYPESET_NOTICE_TITLE,
  TYPESET_PAGE_LINE,
  TYPESET_STILL_LINE,
  TYPESET_TABLE_LINE,
  TYPESET_TOTE_LINE,
  TYPESET_WORKBOOK_LINE,
  isListingTypesetOverlay,
  parseTypesetListingIds,
} from "@/lib/listing-typeset";
import { listingTypesetPath } from "@/lib/paths";

/** PDP banner when this file stays a folding-table page. Does not change the tote. */
export async function ListingTypesetNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseTypesetListingIds(jar.get(TYPESET_COOKIE_NAME)?.value);

  if (!isListingTypesetOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-typeset-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={TYPESET_TABLE_LINE}
        title={TYPESET_NOTICE_TITLE}
        body={`${TYPESET_PAGE_LINE} ${TYPESET_WORKBOOK_LINE} ${TYPESET_STILL_LINE} ${TYPESET_TOTE_LINE}`}
      >
        <Link
          href={listingTypesetPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The typeset card
        </Link>
      </MallNotice>
    </div>
  );
}
