import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  REFLOW_COOKIE_NAME,
  REFLOW_FUSED_LINE,
  REFLOW_LINE_LINE,
  REFLOW_NOTICE_TITLE,
  REFLOW_STILL_LINE,
  REFLOW_TABLE_LINE,
  REFLOW_TOTE_LINE,
  isListingReflowOverlay,
  parseReflowListingIds,
} from "@/lib/listing-reflow";
import { listingReflowPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-reflow-it. Reads the cookie only. */
export async function ListingReflowNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseReflowListingIds(jar.get(REFLOW_COOKIE_NAME)?.value);

  if (!isListingReflowOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-reflow-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={REFLOW_TABLE_LINE}
        title={REFLOW_NOTICE_TITLE}
        body={`${REFLOW_LINE_LINE} ${REFLOW_FUSED_LINE} ${REFLOW_STILL_LINE} ${REFLOW_TOTE_LINE}`}
      >
        <Link
          href={listingReflowPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The reflow card
        </Link>
      </MallNotice>
    </div>
  );
}
