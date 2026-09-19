import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CLIP_COOKIE_NAME,
  CLIP_PAPER_LINE,
  CLIP_REMOTE_LINE,
  CLIP_STACK_LINE,
  CLIP_STILL_LINE,
  CLIP_TABLE_LINE,
  CLIP_TOTE_LINE,
  isListingClipOverlay,
  parseClipListingIds,
} from "@/lib/listing-clip";
import { listingClipPath } from "@/lib/paths";

/** PDP banner when the paper clip walked. Does not change the tote. */
export async function ListingClipNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseClipListingIds(jar.get(CLIP_COOKIE_NAME)?.value);

  if (!isListingClipOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-clip-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The clip walked"
        title={CLIP_TABLE_LINE}
        body={`${CLIP_PAPER_LINE} ${CLIP_REMOTE_LINE} ${CLIP_STACK_LINE} ${CLIP_STILL_LINE} ${CLIP_TOTE_LINE}`}
      >
        <Link
          href={listingClipPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The clip card
        </Link>
      </MallNotice>
    </div>
  );
}
