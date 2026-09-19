import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  EXPIRE_COOKIE_NAME,
  EXPIRE_CREDIT_LINE,
  EXPIRE_NOTICE_TITLE,
  EXPIRE_STILL_LINE,
  EXPIRE_TABLE_LINE,
  EXPIRE_TOTE_LINE,
  EXPIRE_VOID_LINE,
  isListingExpireOverlay,
  parseExpireListingIds,
} from "@/lib/listing-expire";
import { listingExpirePath } from "@/lib/paths";

/** PDP banner when this gift SKU is taped I-will-not-expire-it. Does not change the tote. */
export async function ListingExpireNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseExpireListingIds(jar.get(EXPIRE_COOKIE_NAME)?.value);

  if (!isListingExpireOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-expire-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={EXPIRE_TABLE_LINE}
        title={EXPIRE_NOTICE_TITLE}
        body={`${EXPIRE_VOID_LINE} ${EXPIRE_CREDIT_LINE} ${EXPIRE_STILL_LINE} ${EXPIRE_TOTE_LINE}`}
      >
        <Link
          href={listingExpirePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The expire card
        </Link>
      </MallNotice>
    </div>
  );
}
