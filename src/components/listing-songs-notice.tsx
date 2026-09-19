import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SONGS_COOKIE_NAME,
  SONGS_HISS_LINE,
  SONGS_SCAN_LINE,
  SONGS_STILL_LINE,
  SONGS_TABLE_LINE,
  SONGS_TAPE_LINE,
  SONGS_TOTE_LINE,
  isListingSongsOverlay,
  parseSongsListingIds,
} from "@/lib/listing-songs";
import { listingSongsPath } from "@/lib/paths";

/** PDP banner when this SKU is taped untitled. Does not change the tote. */
export async function ListingSongsNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseSongsListingIds(jar.get(SONGS_COOKIE_NAME)?.value);

  if (!isListingSongsOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-songs-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I will not title the songs"
        title={SONGS_TABLE_LINE}
        body={`${SONGS_HISS_LINE} ${SONGS_SCAN_LINE} ${SONGS_TAPE_LINE} ${SONGS_STILL_LINE} ${SONGS_TOTE_LINE}`}
      >
        <Link
          href={listingSongsPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The untitled-songs card
        </Link>
      </MallNotice>
    </div>
  );
}
