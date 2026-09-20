import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SHIELD_COOKIE_NAME,
  SHIELD_LINE_LINE,
  SHIELD_NOTICE_TITLE,
  SHIELD_STILL_LINE,
  SHIELD_TABLE_LINE,
  SHIELD_TETRIS_LINE,
  SHIELD_TOTE_LINE,
  isListingShieldOverlay,
  parseShieldListingIds,
} from "@/lib/listing-shield";
import { listingShieldPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-shield-it. Reads the cookie only. */
export async function ListingShieldNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseShieldListingIds(jar.get(SHIELD_COOKIE_NAME)?.value);

  if (!isListingShieldOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-shield-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SHIELD_TABLE_LINE}
        title={SHIELD_NOTICE_TITLE}
        body={`${SHIELD_LINE_LINE} ${SHIELD_TETRIS_LINE} ${SHIELD_STILL_LINE} ${SHIELD_TOTE_LINE}`}
      >
        <Link
          href={listingShieldPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The shield card
        </Link>
      </MallNotice>
    </div>
  );
}
