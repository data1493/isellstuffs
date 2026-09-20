import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  SCRAPE_COOKIE_NAME,
  SCRAPE_NOTICE_TITLE,
  SCRAPE_SCRATCH_LINE,
  SCRAPE_SKIP_LINE,
  SCRAPE_STILL_LINE,
  SCRAPE_TABLE_LINE,
  SCRAPE_TOTE_LINE,
  isListingScrapeOverlay,
  parseScrapeListingIds,
} from "@/lib/listing-scrape";
import { listingScrapePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-scrape-it. Reads the cookie only. */
export async function ListingScrapeNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseScrapeListingIds(jar.get(SCRAPE_COOKIE_NAME)?.value);

  if (!isListingScrapeOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-scrape-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={SCRAPE_TABLE_LINE}
        title={SCRAPE_NOTICE_TITLE}
        body={`${SCRAPE_SCRATCH_LINE} ${SCRAPE_SKIP_LINE} ${SCRAPE_STILL_LINE} ${SCRAPE_TOTE_LINE}`}
      >
        <Link
          href={listingScrapePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The scrape card
        </Link>
      </MallNotice>
    </div>
  );
}
