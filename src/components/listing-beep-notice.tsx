import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BEEP_COOKIE_NAME,
  BEEP_NOTICE_TITLE,
  BEEP_PILE_LINE,
  BEEP_STILL_LINE,
  BEEP_TABLE_LINE,
  BEEP_TANGLE_LINE,
  BEEP_TOTE_LINE,
  isListingBeepOverlay,
  parseBeepListingIds,
} from "@/lib/listing-beep";
import { listingBeepPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-beep-it. Does not change the tote. */
export async function ListingBeepNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseBeepListingIds(jar.get(BEEP_COOKIE_NAME)?.value);

  if (!isListingBeepOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-beep-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BEEP_TABLE_LINE}
        title={BEEP_NOTICE_TITLE}
        body={`${BEEP_TANGLE_LINE} ${BEEP_PILE_LINE} ${BEEP_STILL_LINE} ${BEEP_TOTE_LINE}`}
      >
        <Link
          href={listingBeepPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The beep card
        </Link>
      </MallNotice>
    </div>
  );
}
