import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CONTENTS_COOKIE_NAME,
  CONTENTS_NOTICE_TITLE,
  CONTENTS_SCRATCHED_LINE,
  CONTENTS_SHARPIE_LINE,
  CONTENTS_STILL_LINE,
  CONTENTS_TABLE_LINE,
  CONTENTS_TOTE_LINE,
  isListingContentsOverlay,
  parseContentsListingIds,
} from "@/lib/listing-contents";
import { listingContentsPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-list-whats-on-it. Reads the cookie only. */
export async function ListingContentsNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseContentsListingIds(jar.get(CONTENTS_COOKIE_NAME)?.value);

  if (!isListingContentsOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-contents-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={CONTENTS_TABLE_LINE}
        title={CONTENTS_NOTICE_TITLE}
        body={`${CONTENTS_SHARPIE_LINE} ${CONTENTS_SCRATCHED_LINE} ${CONTENTS_STILL_LINE} ${CONTENTS_TOTE_LINE}`}
      >
        <Link
          href={listingContentsPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The contents card
        </Link>
      </MallNotice>
    </div>
  );
}
