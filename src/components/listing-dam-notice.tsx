import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  DAM_COOKIE_NAME,
  DAM_CRACK_LINE,
  DAM_NOTICE_TITLE,
  DAM_STILL_LINE,
  DAM_TABLE_LINE,
  DAM_TETRIS_LINE,
  DAM_TOTE_LINE,
  isListingDamOverlay,
  parseDamListingIds,
} from "@/lib/listing-dam";
import { listingDamPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-dam-it. Reads the cookie only. */
export async function ListingDamNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseDamListingIds(jar.get(DAM_COOKIE_NAME)?.value);

  if (!isListingDamOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-dam-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={DAM_TABLE_LINE}
        title={DAM_NOTICE_TITLE}
        body={`${DAM_CRACK_LINE} ${DAM_TETRIS_LINE} ${DAM_STILL_LINE} ${DAM_TOTE_LINE}`}
      >
        <Link
          href={listingDamPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The dam card
        </Link>
      </MallNotice>
    </div>
  );
}
