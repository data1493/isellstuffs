import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  RADIO_COOKIE_NAME,
  RADIO_NOTICE_TITLE,
  RADIO_STILL_LINE,
  RADIO_SUMMER_LINE,
  RADIO_TABLE_LINE,
  RADIO_TOTE_LINE,
  isListingRadioOverlay,
  parseRadioListingIds,
} from "@/lib/listing-radio";
import { listingRadioPath } from "@/lib/paths";

/** PDP banner when this SKU stays the radio edit. Does not change the tote. */
export async function ListingRadioNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseRadioListingIds(jar.get(RADIO_COOKIE_NAME)?.value);

  if (!isListingRadioOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-radio-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={RADIO_TABLE_LINE}
        title={RADIO_NOTICE_TITLE}
        body={`${RADIO_SUMMER_LINE} ${RADIO_STILL_LINE} ${RADIO_TOTE_LINE}`}
      >
        <Link
          href={listingRadioPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The radio card
        </Link>
      </MallNotice>
    </div>
  );
}
