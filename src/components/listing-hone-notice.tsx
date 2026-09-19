import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  HONE_COOKIE_NAME,
  HONE_NOTICE_TITLE,
  HONE_SKIP_LINE,
  HONE_STILL_LINE,
  HONE_TABLE_LINE,
  HONE_TOTE_LINE,
  HONE_UNNAMED_LINE,
  isListingHoneOverlay,
  parseHoneListingIds,
} from "@/lib/listing-hone";
import { listingHonePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-hone-it. Reads the cookie only. */
export async function ListingHoneNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseHoneListingIds(jar.get(HONE_COOKIE_NAME)?.value);

  if (!isListingHoneOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-hone-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={HONE_TABLE_LINE}
        title={HONE_NOTICE_TITLE}
        body={`${HONE_SKIP_LINE} ${HONE_UNNAMED_LINE} ${HONE_STILL_LINE} ${HONE_TOTE_LINE}`}
      >
        <Link
          href={listingHonePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The hone card
        </Link>
      </MallNotice>
    </div>
  );
}
