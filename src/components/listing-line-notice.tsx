import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  LINE_CELLS_LINE,
  LINE_COOKIE_NAME,
  LINE_PRESS_LINE,
  LINE_SCREEN_LINE,
  LINE_STILL_LINE,
  LINE_TABLE_LINE,
  LINE_TOTE_LINE,
  isListingLineOverlay,
  parseLineListingIds,
} from "@/lib/listing-line";
import { listingLinePath } from "@/lib/paths";

/** PDP banner when this SKU is taped the-line-stays. Does not change the tote. */
export async function ListingLineNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseLineListingIds(jar.get(LINE_COOKIE_NAME)?.value);

  if (!isListingLineOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-line-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The line stays"
        title={LINE_TABLE_LINE}
        body={`${LINE_CELLS_LINE} ${LINE_SCREEN_LINE} ${LINE_PRESS_LINE} ${LINE_STILL_LINE} ${LINE_TOTE_LINE}`}
      >
        <Link
          href={listingLinePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The screen-line card
        </Link>
      </MallNotice>
    </div>
  );
}
