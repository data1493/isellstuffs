import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BPM_COOKIE_NAME,
  BPM_CONVERT_LINE,
  BPM_NOTICE_TITLE,
  BPM_STEMS_LINE,
  BPM_STILL_LINE,
  BPM_TOTE_LINE,
  isListingBpmOverlay,
  parseBpmListingIds,
} from "@/lib/listing-bpm";
import { listingBpmPath } from "@/lib/paths";

/** PDP banner when this file's BPM is a guess. Does not change the tote. */
export async function ListingBpmNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseBpmListingIds(jar.get(BPM_COOKIE_NAME)?.value);

  if (!isListingBpmOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-bpm-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="BPM is a guess"
        title={BPM_NOTICE_TITLE}
        body={`${BPM_STEMS_LINE} ${BPM_CONVERT_LINE} ${BPM_STILL_LINE} ${BPM_TOTE_LINE}`}
      >
        <Link
          href={listingBpmPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The BPM card
        </Link>
      </MallNotice>
    </div>
  );
}
