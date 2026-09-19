import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  GUM_COOKIE_NAME,
  GUM_NOTICE_TITLE,
  GUM_RESIDUE_LINE,
  GUM_STILL_LINE,
  GUM_TABLE_LINE,
  GUM_TOTE_LINE,
  isListingGumOverlay,
  parseGumListingIds,
} from "@/lib/listing-gum";
import { listingGumPath } from "@/lib/paths";

/** PDP banner when this SKU is taped the-stickers-stay. Does not change the tote. */
export async function ListingGumNotice({ listingId }: { listingId: string }) {
  const jar = await cookies();
  const ids = parseGumListingIds(jar.get(GUM_COOKIE_NAME)?.value);

  if (!isListingGumOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-gum-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={GUM_TABLE_LINE}
        title={GUM_NOTICE_TITLE}
        body={`${GUM_RESIDUE_LINE} ${GUM_STILL_LINE} ${GUM_TOTE_LINE}`}
      >
        <Link
          href={listingGumPath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The sticker card
        </Link>
      </MallNotice>
    </div>
  );
}
