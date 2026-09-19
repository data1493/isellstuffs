import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { listingById } from "@/lib/commerce";
import {
  WITH_COOKIE_NAME,
  WITH_MATE_LINE,
  WITH_TABLE_LINE,
  WITH_TOTE_LINE,
  WITH_VAN_LINE,
  mateOf,
  parseWithPairs,
} from "@/lib/listing-with";
import { listingPath, listingWithPath } from "@/lib/paths";

/** PDP banner when this SKU walks with a mate. Does not change the tote. */
export async function ListingWithNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const pairs = parseWithPairs(jar.get(WITH_COOKIE_NAME)?.value);
  const mateId = mateOf(listingId, pairs);

  if (!mateId) {
    return null;
  }

  const mate = listingById(mateId);

  return (
    <div data-with-notice={listingId} data-with-mate={mateId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="These two go together"
        title={
          mate ? `Walks with ${mate.title}` : WITH_TABLE_LINE
        }
        body={`${WITH_MATE_LINE} ${WITH_TOTE_LINE} ${WITH_VAN_LINE}`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            href={listingWithPath(listingId)}
            className="text-sm underline-offset-4 hover:underline"
          >
            The pair card
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
