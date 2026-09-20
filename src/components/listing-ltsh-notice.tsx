import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  LTSH_BOLD_LINE,
  LTSH_COOKIE_NAME,
  LTSH_NOTICE_TITLE,
  LTSH_STILL_LINE,
  LTSH_TABLE_LINE,
  LTSH_TOTE_LINE,
  LTSH_WEIGHTS_LINE,
  isListingLtshOverlay,
  parseLtshListingIds,
} from "@/lib/listing-ltsh";
import { listingLtshPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-ltsh-it. Reads the cookie only. */
export async function ListingLtshNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseLtshListingIds(jar.get(LTSH_COOKIE_NAME)?.value);

  if (!isListingLtshOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-ltsh-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={LTSH_TABLE_LINE}
        title={LTSH_NOTICE_TITLE}
        body={`${LTSH_WEIGHTS_LINE} ${LTSH_BOLD_LINE} ${LTSH_STILL_LINE} ${LTSH_TOTE_LINE}`}
      >
        <Link
          href={listingLtshPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The ltsh card
        </Link>
      </MallNotice>
    </div>
  );
}
