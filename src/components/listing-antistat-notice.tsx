import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  ANTISTAT_COOKIE_NAME,
  ANTISTAT_NOTICE_TITLE,
  ANTISTAT_SCRATCH_LINE,
  ANTISTAT_SKIP_LINE,
  ANTISTAT_STILL_LINE,
  ANTISTAT_TABLE_LINE,
  ANTISTAT_TOTE_LINE,
  isListingAntistatOverlay,
  parseAntistatListingIds,
} from "@/lib/listing-antistat";
import { listingAntistatPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-antistat-it. Reads the cookie only. */
export async function ListingAntistatNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseAntistatListingIds(jar.get(ANTISTAT_COOKIE_NAME)?.value);

  if (!isListingAntistatOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-antistat-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={ANTISTAT_TABLE_LINE}
        title={ANTISTAT_NOTICE_TITLE}
        body={`${ANTISTAT_SCRATCH_LINE} ${ANTISTAT_SKIP_LINE} ${ANTISTAT_STILL_LINE} ${ANTISTAT_TOTE_LINE}`}
      >
        <Link
          href={listingAntistatPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The antistat card
        </Link>
      </MallNotice>
    </div>
  );
}
