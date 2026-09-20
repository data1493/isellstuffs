import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PREGAP_BURN_LINE,
  PREGAP_COOKIE_NAME,
  PREGAP_NOTICE_TITLE,
  PREGAP_SCRATCHED_LINE,
  PREGAP_STILL_LINE,
  PREGAP_TABLE_LINE,
  PREGAP_TOTE_LINE,
  isListingPregapOverlay,
  parsePregapListingIds,
} from "@/lib/listing-pregap";
import { listingPregapPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-pregap-it. Reads the cookie only. */
export async function ListingPregapNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parsePregapListingIds(jar.get(PREGAP_COOKIE_NAME)?.value);

  if (!isListingPregapOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-pregap-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PREGAP_TABLE_LINE}
        title={PREGAP_NOTICE_TITLE}
        body={`${PREGAP_BURN_LINE} ${PREGAP_SCRATCHED_LINE} ${PREGAP_STILL_LINE} ${PREGAP_TOTE_LINE}`}
      >
        <Link
          href={listingPregapPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The pregap card
        </Link>
      </MallNotice>
    </div>
  );
}
