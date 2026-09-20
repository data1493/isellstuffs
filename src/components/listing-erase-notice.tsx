import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  ERASE_COOKIE_NAME,
  ERASE_HISS_LINE,
  ERASE_NOTICE_TITLE,
  ERASE_RADIO_LINE,
  ERASE_STILL_LINE,
  ERASE_TABLE_LINE,
  ERASE_TOTE_LINE,
  isListingEraseOverlay,
  parseEraseListingIds,
} from "@/lib/listing-erase";
import { listingErasePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-erase-it. Reads the cookie only. */
export async function ListingEraseNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseEraseListingIds(jar.get(ERASE_COOKIE_NAME)?.value);

  if (!isListingEraseOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-erase-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={ERASE_TABLE_LINE}
        title={ERASE_NOTICE_TITLE}
        body={`${ERASE_RADIO_LINE} ${ERASE_HISS_LINE} ${ERASE_STILL_LINE} ${ERASE_TOTE_LINE}`}
      >
        <Link
          href={listingErasePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The erase card
        </Link>
      </MallNotice>
    </div>
  );
}
