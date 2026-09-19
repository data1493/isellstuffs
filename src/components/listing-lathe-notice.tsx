import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  LATHE_COOKIE_NAME,
  LATHE_NOTICE_TITLE,
  LATHE_SCRATCHED_LINE,
  LATHE_SHARPIE_LINE,
  LATHE_STILL_LINE,
  LATHE_TABLE_LINE,
  LATHE_TOTE_LINE,
  isListingLatheOverlay,
  parseLatheListingIds,
} from "@/lib/listing-lathe";
import { listingLathePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-lathe-it. Reads the cookie only. */
export async function ListingLatheNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseLatheListingIds(jar.get(LATHE_COOKIE_NAME)?.value);

  if (!isListingLatheOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-lathe-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={LATHE_TABLE_LINE}
        title={LATHE_NOTICE_TITLE}
        body={`${LATHE_SCRATCHED_LINE} ${LATHE_SHARPIE_LINE} ${LATHE_STILL_LINE} ${LATHE_TOTE_LINE}`}
      >
        <Link
          href={listingLathePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The lathe card
        </Link>
      </MallNotice>
    </div>
  );
}
