import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  HINT_COOKIE_NAME,
  HINT_MAP_LINE,
  HINT_NOTICE_TITLE,
  HINT_STILL_LINE,
  HINT_TABLE_LINE,
  HINT_TOTE_LINE,
  HINT_WEIGHTS_LINE,
  isListingHintOverlay,
  parseHintListingIds,
} from "@/lib/listing-hint";
import { listingHintPath } from "@/lib/paths";

/** PDP banner when this file stays two weights. Does not change the tote. */
export async function ListingHintNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseHintListingIds(jar.get(HINT_COOKIE_NAME)?.value);

  if (!isListingHintOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-hint-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={HINT_TABLE_LINE}
        title={HINT_NOTICE_TITLE}
        body={`${HINT_WEIGHTS_LINE} ${HINT_MAP_LINE} ${HINT_STILL_LINE} ${HINT_TOTE_LINE}`}
      >
        <Link
          href={listingHintPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The hint card
        </Link>
      </MallNotice>
    </div>
  );
}
