import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  LINING_COOKIE_NAME,
  LINING_JACKET_LINE,
  LINING_NOTICE_TITLE,
  LINING_SHELL_LINE,
  LINING_STILL_LINE,
  LINING_TABLE_LINE,
  LINING_TOTE_LINE,
  isListingLiningOverlay,
  parseLiningListingIds,
} from "@/lib/listing-lining";
import { listingLiningPath } from "@/lib/paths";

/** PDP banner when this SKU is taped I-don’t-have-a-lining. Reads the cookie only. */
export async function ListingLiningNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseLiningListingIds(jar.get(LINING_COOKIE_NAME)?.value);

  if (!isListingLiningOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-lining-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={LINING_TABLE_LINE}
        title={LINING_NOTICE_TITLE}
        body={`${LINING_SHELL_LINE} ${LINING_JACKET_LINE} ${LINING_STILL_LINE} ${LINING_TOTE_LINE}`}
      >
        <Link
          href={listingLiningPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The lining card
        </Link>
      </MallNotice>
    </div>
  );
}
