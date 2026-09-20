import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  ANTISKATE_COOKIE_NAME,
  ANTISKATE_NOTICE_TITLE,
  ANTISKATE_SKIP_LINE,
  ANTISKATE_STILL_LINE,
  ANTISKATE_TABLE_LINE,
  ANTISKATE_TOTE_LINE,
  ANTISKATE_UNNAMED_LINE,
  isListingAntiskateOverlay,
  parseAntiskateListingIds,
} from "@/lib/listing-antiskate";
import { listingAntiskatePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-antiskate-it. Reads the cookie only. */
export async function ListingAntiskateNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseAntiskateListingIds(jar.get(ANTISKATE_COOKIE_NAME)?.value);

  if (!isListingAntiskateOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-antiskate-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={ANTISKATE_TABLE_LINE}
        title={ANTISKATE_NOTICE_TITLE}
        body={`${ANTISKATE_SKIP_LINE} ${ANTISKATE_UNNAMED_LINE} ${ANTISKATE_STILL_LINE} ${ANTISKATE_TOTE_LINE}`}
      >
        <Link
          href={listingAntiskatePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The antiskate card
        </Link>
      </MallNotice>
    </div>
  );
}
