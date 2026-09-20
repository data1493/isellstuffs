import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  CUE_COOKIE_NAME,
  CUE_NOTICE_TITLE,
  CUE_SHARPIE_LINE,
  CUE_SKIP_LINE,
  CUE_STILL_LINE,
  CUE_TABLE_LINE,
  CUE_TOTE_LINE,
  isListingCueOverlay,
  parseCueListingIds,
} from "@/lib/listing-cue";
import { listingCuePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-cue-it. Reads the cookie only. */
export async function ListingCueNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseCueListingIds(jar.get(CUE_COOKIE_NAME)?.value);

  if (!isListingCueOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-cue-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={CUE_TABLE_LINE}
        title={CUE_NOTICE_TITLE}
        body={`${CUE_SHARPIE_LINE} ${CUE_SKIP_LINE} ${CUE_STILL_LINE} ${CUE_TOTE_LINE}`}
      >
        <Link
          href={listingCuePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The cue card
        </Link>
      </MallNotice>
    </div>
  );
}
