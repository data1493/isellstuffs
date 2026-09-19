import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  REMOTE_CELLS_LINE,
  REMOTE_CLICKER_LINE,
  REMOTE_COOKIE_NAME,
  REMOTE_PARTS_LINE,
  REMOTE_STILL_LINE,
  REMOTE_TABLE_LINE,
  REMOTE_TOTE_LINE,
  isListingRemoteOverlay,
  parseRemoteListingIds,
} from "@/lib/listing-remote";
import { listingRemotePath } from "@/lib/paths";

/** PDP banner when this SKU is taped remote-walked. Does not change the tote. */
export async function ListingRemoteNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseRemoteListingIds(jar.get(REMOTE_COOKIE_NAME)?.value);

  if (!isListingRemoteOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-remote-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The remote walked"
        title={REMOTE_TABLE_LINE}
        body={`${REMOTE_CLICKER_LINE} ${REMOTE_STILL_LINE} ${REMOTE_TOTE_LINE} ${REMOTE_CELLS_LINE} ${REMOTE_PARTS_LINE}`}
      >
        <Link
          href={listingRemotePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The remote card
        </Link>
      </MallNotice>
    </div>
  );
}
