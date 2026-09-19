import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { listingById } from "@/lib/commerce";
import {
  SCAN_COOKIE_NAME,
  SCAN_MATE_LINE,
  SCAN_TABLE_LINE,
  SCAN_TOTE_LINE,
  SCAN_WITH_LINE,
  parseScanPairs,
  scanMateOf,
} from "@/lib/listing-scan";
import { listingPath, listingScanPath } from "@/lib/paths";

/** PDP banner when this SKU scans to a paper or a file. Does not change the tote. */
export async function ListingScanNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const pairs = parseScanPairs(jar.get(SCAN_COOKIE_NAME)?.value);
  const mateId = scanMateOf(listingId, pairs);

  if (!mateId) {
    return null;
  }

  const mate = listingById(mateId);

  return (
    <div data-scan-notice={listingId} data-scan-mate={mateId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Scan the liner"
        title={
          mate ? `Scans with ${mate.title}` : SCAN_TABLE_LINE
        }
        body={`${SCAN_MATE_LINE} ${SCAN_TOTE_LINE} ${SCAN_WITH_LINE}`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            href={listingScanPath(listingId)}
            className="text-sm underline-offset-4 hover:underline"
          >
            The scan card
          </Link>
          {mate ? (
            <Link
              href={listingPath(mate.id)}
              className="text-sm underline-offset-4 hover:underline"
            >
              Open the mate
            </Link>
          ) : null}
        </div>
      </MallNotice>
    </div>
  );
}
