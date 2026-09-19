import { cookies } from "next/headers";
import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import {
  VARIABLE_ALMOST_LINE,
  VARIABLE_COOKIE_NAME,
  VARIABLE_NOTICE_TITLE,
  VARIABLE_STILL_LINE,
  VARIABLE_TABLE_LINE,
  VARIABLE_TOTE_LINE,
  VARIABLE_WEIGHTS_LINE,
  isListingVariableOverlay,
  parseVariableListingIds,
} from "@/lib/listing-variable";
import { listingVariablePath } from "@/lib/paths";

/** PDP honesty overlay when this SKU is taped I-will-not-variable-it. Reads the cookie only. */
export async function ListingVariableNotice({
  listingId,
}: {
  listingId: string;
}) {
  const jar = await cookies();
  const ids = parseVariableListingIds(jar.get(VARIABLE_COOKIE_NAME)?.value);

  if (!isListingVariableOverlay(listingId, ids)) {
    return null;
  }

  return (
    <div data-variable-notice={listingId}>
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow={VARIABLE_TABLE_LINE}
        title={VARIABLE_NOTICE_TITLE}
        body={`${VARIABLE_WEIGHTS_LINE} ${VARIABLE_ALMOST_LINE} ${VARIABLE_STILL_LINE} ${VARIABLE_TOTE_LINE}`}
      >
        <Link
          href={listingVariablePath(listingId)}
          className="text-sm underline-offset-4 hover:underline"
        >
          The variable card
        </Link>
      </MallNotice>
    </div>
  );
}
