import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SMOKE_COOKIE_NAME,
  SMOKE_POCKETS_LINE,
  SMOKE_SMELL_LINE,
  SMOKE_STILL_LINE,
  SMOKE_TABLE_LINE,
  SMOKE_TOTE_LINE,
  isListingSmokeOverlay,
  parseSmokeListingIds,
} from "@/lib/listing-smoke";
import { listingSmokePath } from "@/lib/paths";

/** PDP banner when this SKU smells like smoke. Does not change the tote. */
export async function ListingSmokeNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseSmokeListingIds(jar.get(SMOKE_COOKIE_NAME)?.value);

  if (!isListingSmokeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-smoke-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Smells like smoke"
        title={SMOKE_TABLE_LINE}
        body={`${SMOKE_POCKETS_LINE} ${SMOKE_SMELL_LINE} ${SMOKE_STILL_LINE} ${SMOKE_TOTE_LINE}`}
      >
        <Link
          href={listingSmokePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The smoke card
        </Link>
      </MallNotice>
    </div>
  );
}
