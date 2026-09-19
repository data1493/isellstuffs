import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GASKET_COOKIE_NAME,
  GASKET_KNOB_LINE,
  GASKET_LID_LINE,
  GASKET_NOTICE_TITLE,
  GASKET_STILL_LINE,
  GASKET_TABLE_LINE,
  GASKET_TOTE_LINE,
  isListingGasketOverlay,
  parseGasketListingIds,
} from "@/lib/listing-gasket";
import { listingGasketPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-gasket. Does not change the tote. */
export async function ListingGasketNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseGasketListingIds(jar.get(GASKET_COOKIE_NAME)?.value);

  if (!isListingGasketOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-gasket-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GASKET_TABLE_LINE}
        title={GASKET_NOTICE_TITLE}
        body={`${GASKET_KNOB_LINE} ${GASKET_LID_LINE} ${GASKET_STILL_LINE} ${GASKET_TOTE_LINE}`}
      >
        <Link
          href={listingGasketPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The gasket card
        </Link>
      </MallNotice>
    </div>
  );
}
