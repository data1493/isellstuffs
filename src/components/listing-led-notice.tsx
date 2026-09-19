import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  LED_COOKIE_NAME,
  LED_LIGHTS_LINE,
  LED_NOTICE_TITLE,
  LED_STILL_LINE,
  LED_TABLE_LINE,
  LED_TOTE_LINE,
  isListingLedOverlay,
  parseLedListingIds,
} from "@/lib/listing-led";
import { listingLedPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-LED-it. Does not change the tote. */
export async function ListingLedNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseLedListingIds(jar.get(LED_COOKIE_NAME)?.value);

  if (!isListingLedOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-led-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={LED_TABLE_LINE}
        title={LED_NOTICE_TITLE}
        body={`${LED_LIGHTS_LINE} ${LED_STILL_LINE} ${LED_TOTE_LINE}`}
      >
        <Link
          href={listingLedPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The led card
        </Link>
      </MallNotice>
    </div>
  );
}
