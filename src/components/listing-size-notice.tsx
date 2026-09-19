import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SIZE_COOKIE_NAME,
  SIZE_LIE_LINE,
  SIZE_PRESS_LINE,
  SIZE_STILL_LINE,
  SIZE_TABLE_LINE,
  SIZE_TOTE_LINE,
  isListingSizeOverlay,
  parseSizeListingIds,
} from "@/lib/listing-size";
import { listingSizePath } from "@/lib/paths";

/** PDP banner when this SKU’s sewn-in tag lied. Does not change the tote. */
export async function ListingSizeNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseSizeListingIds(jar.get(SIZE_COOKIE_NAME)?.value);

  if (!isListingSizeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-size-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Tag says L"
        title={SIZE_TABLE_LINE}
        body={`${SIZE_PRESS_LINE} ${SIZE_LIE_LINE} ${SIZE_STILL_LINE} ${SIZE_TOTE_LINE}`}
      >
        <Link
          href={listingSizePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The size card
        </Link>
      </MallNotice>
    </div>
  );
}
