import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  INK_COOKIE_NAME,
  INK_HAND_LINE,
  INK_PLAYS_LINE,
  INK_SONGS_LINE,
  INK_STILL_LINE,
  INK_TABLE_LINE,
  INK_TOTE_LINE,
  isListingInkOverlay,
  parseInkListingIds,
} from "@/lib/listing-ink";
import { listingInkPath } from "@/lib/paths";

/** PDP banner when this SKU is taped the-Sharpie-stays. Does not change the tote. */
export async function ListingInkNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseInkListingIds(jar.get(INK_COOKIE_NAME)?.value);

  if (!isListingInkOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-ink-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The Sharpie stays"
        title={INK_TABLE_LINE}
        body={`${INK_PLAYS_LINE} ${INK_SONGS_LINE} ${INK_HAND_LINE} ${INK_STILL_LINE} ${INK_TOTE_LINE}`}
      >
        <Link
          href={listingInkPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The Sharpie card
        </Link>
      </MallNotice>
    </div>
  );
}
