import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  RESONANCE_COOKIE_NAME,
  RESONANCE_NOTICE_TITLE,
  RESONANCE_SKIP_LINE,
  RESONANCE_STILL_LINE,
  RESONANCE_TABLE_LINE,
  RESONANCE_TOTE_LINE,
  RESONANCE_UNNAMED_LINE,
  isListingResonanceOverlay,
  parseResonanceListingIds,
} from "@/lib/listing-resonance";
import { listingResonancePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-resonance-it. Reads the cookie only. */
export async function ListingResonanceNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseResonanceListingIds(jar.get(RESONANCE_COOKIE_NAME)?.value);

  if (!isListingResonanceOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-resonance-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={RESONANCE_TABLE_LINE}
        title={RESONANCE_NOTICE_TITLE}
        body={`${RESONANCE_SKIP_LINE} ${RESONANCE_UNNAMED_LINE} ${RESONANCE_STILL_LINE} ${RESONANCE_TOTE_LINE}`}
      >
        <Link
          href={listingResonancePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The resonance card
        </Link>
      </MallNotice>
    </div>
  );
}
