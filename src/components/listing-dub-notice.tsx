import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  DUB_COOKIE_NAME,
  DUB_HISS_LINE,
  DUB_NOTICE_TITLE,
  DUB_RADIO_LINE,
  DUB_STILL_LINE,
  DUB_TABLE_LINE,
  DUB_TOTE_LINE,
  isListingDubOverlay,
  parseDubListingIds,
} from "@/lib/listing-dub";
import { listingDubPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-dub-it. Reads the cookie only. */
export async function ListingDubNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseDubListingIds(jar.get(DUB_COOKIE_NAME)?.value);

  if (!isListingDubOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-dub-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={DUB_TABLE_LINE}
        title={DUB_NOTICE_TITLE}
        body={`${DUB_HISS_LINE} ${DUB_RADIO_LINE} ${DUB_STILL_LINE} ${DUB_TOTE_LINE}`}
      >
        <Link
          href={listingDubPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The dub card
        </Link>
      </MallNotice>
    </div>
  );
}
