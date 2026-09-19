import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GLASS_COOKIE_NAME,
  GLASS_KNOB_LINE,
  GLASS_LID_LINE,
  GLASS_NOTICE_TITLE,
  GLASS_STILL_LINE,
  GLASS_TABLE_LINE,
  GLASS_TOTE_LINE,
  isListingGlassOverlay,
  parseGlassListingIds,
} from "@/lib/listing-glass";
import { listingGlassPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-replace-the-glass. Does not change the tote. */
export async function ListingGlassNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseGlassListingIds(jar.get(GLASS_COOKIE_NAME)?.value);

  if (!isListingGlassOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-glass-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GLASS_TABLE_LINE}
        title={GLASS_NOTICE_TITLE}
        body={`${GLASS_LID_LINE} ${GLASS_KNOB_LINE} ${GLASS_STILL_LINE} ${GLASS_TOTE_LINE}`}
      >
        <Link
          href={listingGlassPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The glass card
        </Link>
      </MallNotice>
    </div>
  );
}
