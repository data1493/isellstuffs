import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BOOK_CASES_LINE,
  BOOK_COOKIE_NAME,
  BOOK_LINER_LINE,
  BOOK_STILL_LINE,
  BOOK_TABLE_LINE,
  BOOK_TOTE_LINE,
  isListingBookOverlay,
  parseBookListingIds,
} from "@/lib/listing-book";
import { listingBookPath } from "@/lib/paths";

/** PDP banner when this SKU is missing its booklet. Does not change the tote. */
export async function ListingBookNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseBookListingIds(jar.get(BOOK_COOKIE_NAME)?.value);

  if (!isListingBookOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-book-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The booklet walked"
        title={BOOK_TABLE_LINE}
        body={`${BOOK_LINER_LINE} ${BOOK_CASES_LINE} ${BOOK_STILL_LINE} ${BOOK_TOTE_LINE}`}
      >
        <Link
          href={listingBookPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The booklet card
        </Link>
      </MallNotice>
    </div>
  );
}
