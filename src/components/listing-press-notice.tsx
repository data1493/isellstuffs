import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PRESS_COOKIE_NAME,
  PRESS_SCAN_LINE,
  PRESS_STILL_LINE,
  PRESS_TABLE_LINE,
  PRESS_TOTE_LINE,
  listingPressFor,
  parseListingPress,
} from "@/lib/listing-press";
import { listingPressPath } from "@/lib/paths";

/** PDP banner when this SKU has a press note. Does not change the tote. */
export async function ListingPressNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const map = parseListingPress(jar.get(PRESS_COOKIE_NAME)?.value);
  const current = listingPressFor(listingId, map);

  if (!current) {
    return null;
  }

  return (
    <div data-press-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PRESS_TABLE_LINE}
        title={current.note}
        body={`${PRESS_STILL_LINE} ${PRESS_TOTE_LINE} ${PRESS_SCAN_LINE}`}
      >
        <Link
          href={listingPressPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The press card
        </Link>
      </MallNotice>
    </div>
  );
}
