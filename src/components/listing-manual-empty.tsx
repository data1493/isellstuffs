import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { MANUAL_EMPTY_LINE, MANUAL_TABLE_LINE } from "@/lib/listing-manual";
import { listingPath } from "@/lib/paths";

export function ListingManualEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-manual-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Paper in the box"
        title={MANUAL_EMPTY_LINE}
        body={`${MANUAL_TABLE_LINE} Tape it when the instruction paper is gone. It does not drop the tote or mark it sold.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={listingPath(listingId)} />}
          >
            Back to the listing
          </Button>
        }
      />
    </div>
  );
}
