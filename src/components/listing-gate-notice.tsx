import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GATE_COOKIE_NAME,
  GATE_LOOP_LINE,
  GATE_NOTICE_TITLE,
  GATE_SHOTS_LINE,
  GATE_STILL_LINE,
  GATE_TABLE_LINE,
  GATE_TOTE_LINE,
  isListingGateOverlay,
  parseGateListingIds,
} from "@/lib/listing-gate";
import { listingGatePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-gate-it. Reads the cookie only. */
export async function ListingGateNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseGateListingIds(jar.get(GATE_COOKIE_NAME)?.value);

  if (!isListingGateOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-gate-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GATE_TABLE_LINE}
        title={GATE_NOTICE_TITLE}
        body={`${GATE_SHOTS_LINE} ${GATE_LOOP_LINE} ${GATE_STILL_LINE} ${GATE_TOTE_LINE}`}
      >
        <Link
          href={listingGatePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The gate card
        </Link>
      </MallNotice>
    </div>
  );
}
