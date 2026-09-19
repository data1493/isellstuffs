import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  KEY_BOX_LINE,
  KEY_COOKIE_NAME,
  KEY_LOST_LINE,
  KEY_REMOTE_LINE,
  KEY_STILL_LINE,
  KEY_TABLE_LINE,
  KEY_TOTE_LINE,
  isListingKeyOverlay,
  parseKeyListingIds,
} from "@/lib/listing-key";
import { listingKeyPath } from "@/lib/paths";

/** PDP banner when this SKU is taped key-walked. Does not change the tote. */
export async function ListingKeyNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseKeyListingIds(jar.get(KEY_COOKIE_NAME)?.value);

  if (!isListingKeyOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-key-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The key walked"
        title={KEY_TABLE_LINE}
        body={`${KEY_BOX_LINE} ${KEY_STILL_LINE} ${KEY_TOTE_LINE} ${KEY_REMOTE_LINE} ${KEY_LOST_LINE}`}
      >
        <Link
          href={listingKeyPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The key card
        </Link>
      </MallNotice>
    </div>
  );
}
