import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PAGINATE_COOKIE_NAME,
  PAGINATE_NOTICE_TITLE,
  PAGINATE_PAGE_LINE,
  PAGINATE_RULE_LINE,
  PAGINATE_STILL_LINE,
  PAGINATE_TABLE_LINE,
  PAGINATE_TOTE_LINE,
  isListingPaginateOverlay,
  parsePaginateListingIds,
} from "@/lib/listing-paginate";
import { listingPaginatePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-paginate-it. Reads the cookie only. */
export async function ListingPaginateNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parsePaginateListingIds(jar.get(PAGINATE_COOKIE_NAME)?.value);

  if (!isListingPaginateOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-paginate-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PAGINATE_TABLE_LINE}
        title={PAGINATE_NOTICE_TITLE}
        body={`${PAGINATE_PAGE_LINE} ${PAGINATE_RULE_LINE} ${PAGINATE_STILL_LINE} ${PAGINATE_TOTE_LINE}`}
      >
        <Link
          href={listingPaginatePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The paginate card
        </Link>
      </MallNotice>
    </div>
  );
}
