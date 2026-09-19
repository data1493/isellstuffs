import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  ASK_COOKIE_NAME,
  ASK_SLEEVE_LINE,
  ASK_STILL_LINE,
  ASK_TABLE_LINE,
  ASK_TOTE_LINE,
  isListingAskOverlay,
  parseAskListingIds,
} from "@/lib/ask-first";
import { listingAskPath } from "@/lib/paths";

/** PDP banner when this SKU is ask-first. Does not change the tote. */
export async function ListingAskNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseAskListingIds(jar.get(ASK_COOKIE_NAME)?.value);

  if (!isListingAskOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-ask-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Ask first"
        title={ASK_TABLE_LINE}
        body={`${ASK_STILL_LINE} ${ASK_TOTE_LINE} ${ASK_SLEEVE_LINE}`}
      >
        <Link
          href={listingAskPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The ask card
        </Link>
      </MallNotice>
    </div>
  );
}
