import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  PAD_COOKIE_NAME,
  PAD_NOTICE_TITLE,
  PAD_PAIR_LINE,
  PAD_PEEL_LINE,
  PAD_STILL_LINE,
  PAD_TABLE_LINE,
  PAD_TOTE_LINE,
  isListingPadOverlay,
  parsePadListingIds,
} from "@/lib/listing-pad";
import { listingPadPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-will-not-pad-them. Reads the cookie only. */
export async function ListingPadNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parsePadListingIds(jar.get(PAD_COOKIE_NAME)?.value);

  if (!isListingPadOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-pad-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={PAD_TABLE_LINE}
        title={PAD_NOTICE_TITLE}
        body={`${PAD_PEEL_LINE} ${PAD_PAIR_LINE} ${PAD_STILL_LINE} ${PAD_TOTE_LINE}`}
      >
        <Link
          href={listingPadPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The pad card
        </Link>
      </MallNotice>
    </div>
  );
}
