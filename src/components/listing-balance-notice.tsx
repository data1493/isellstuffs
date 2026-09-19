import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  BALANCE_COOKIE_NAME,
  BALANCE_LOOKS_LINE,
  BALANCE_NOTICE_TITLE,
  BALANCE_STILL_LINE,
  BALANCE_TABLE_LINE,
  BALANCE_TOTE_LINE,
  BALANCE_TUNGSTEN_LINE,
  BALANCE_WALK_LINE,
  BALANCE_WARM_LINE,
  isListingBalanceOverlay,
  parseBalanceListingIds,
} from "@/lib/listing-balance";
import { listingBalancePath } from "@/lib/paths";

/** PDP banner when this file is taped I-will-not-balance-it. Does not change the tote. */
export async function ListingBalanceNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseBalanceListingIds(jar.get(BALANCE_COOKIE_NAME)?.value);

  if (!isListingBalanceOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-balance-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={BALANCE_TABLE_LINE}
        title={BALANCE_NOTICE_TITLE}
        body={`${BALANCE_LOOKS_LINE} ${BALANCE_TUNGSTEN_LINE} ${BALANCE_WARM_LINE} ${BALANCE_WALK_LINE} ${BALANCE_STILL_LINE} ${BALANCE_TOTE_LINE}`}
      >
        <Link
          href={listingBalancePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The balance card
        </Link>
      </MallNotice>
    </div>
  );
}
