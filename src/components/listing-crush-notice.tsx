import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CRUSH_COOKIE_NAME,
  CRUSH_NOTICE_TITLE,
  CRUSH_SHOTS_LINE,
  CRUSH_STILL_LINE,
  CRUSH_TABLE_LINE,
  CRUSH_TOTE_LINE,
  CRUSH_ZIP_LINE,
  isListingCrushOverlay,
  parseCrushListingIds,
} from "@/lib/listing-crush";
import { listingCrushPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-crush-it. Reads the cookie only. */
export async function ListingCrushNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseCrushListingIds(jar.get(CRUSH_COOKIE_NAME)?.value);

  if (!isListingCrushOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-crush-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={CRUSH_TABLE_LINE}
        title={CRUSH_NOTICE_TITLE}
        body={`${CRUSH_SHOTS_LINE} ${CRUSH_ZIP_LINE} ${CRUSH_STILL_LINE} ${CRUSH_TOTE_LINE}`}
      >
        <Link
          href={listingCrushPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The crush card
        </Link>
      </MallNotice>
    </div>
  );
}
