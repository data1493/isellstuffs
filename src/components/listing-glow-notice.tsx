import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GLOW_COOKIE_NAME,
  GLOW_LINE_LINE,
  GLOW_NOTICE_TITLE,
  GLOW_PLAYS_LINE,
  GLOW_STILL_LINE,
  GLOW_TABLE_LINE,
  GLOW_TOTE_LINE,
  isListingGlowOverlay,
  parseGlowListingIds,
} from "@/lib/listing-glow";
import { listingGlowPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-don't-have-a-backlight. Does not change the tote. */
export async function ListingGlowNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseGlowListingIds(jar.get(GLOW_COOKIE_NAME)?.value);

  if (!isListingGlowOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-glow-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GLOW_TABLE_LINE}
        title={GLOW_NOTICE_TITLE}
        body={`${GLOW_LINE_LINE} ${GLOW_PLAYS_LINE} ${GLOW_STILL_LINE} ${GLOW_TOTE_LINE}`}
      >
        <Link
          href={listingGlowPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The glow card
        </Link>
      </MallNotice>
    </div>
  );
}
