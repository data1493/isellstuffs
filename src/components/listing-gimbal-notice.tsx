import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GIMBAL_COOKIE_NAME,
  GIMBAL_NOTICE_TITLE,
  GIMBAL_SKIP_LINE,
  GIMBAL_STILL_LINE,
  GIMBAL_TABLE_LINE,
  GIMBAL_TOTE_LINE,
  GIMBAL_UNNAMED_LINE,
  isListingGimbalOverlay,
  parseGimbalListingIds,
} from "@/lib/listing-gimbal";
import { listingGimbalPath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-gimbal-it. Reads the cookie only. */
export async function ListingGimbalNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseGimbalListingIds(jar.get(GIMBAL_COOKIE_NAME)?.value);

  if (!isListingGimbalOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-gimbal-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GIMBAL_TABLE_LINE}
        title={GIMBAL_NOTICE_TITLE}
        body={`${GIMBAL_SKIP_LINE} ${GIMBAL_UNNAMED_LINE} ${GIMBAL_STILL_LINE} ${GIMBAL_TOTE_LINE}`}
      >
        <Link
          href={listingGimbalPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The gimbal card
        </Link>
      </MallNotice>
    </div>
  );
}
