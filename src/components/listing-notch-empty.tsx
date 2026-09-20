import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { NOTCH_EMPTY_LINE, NOTCH_TABLE_LINE } from "@/lib/listing-notch";
import { listingPath } from "@/lib/paths";

export function ListingNotchEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-notch-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Notch not taped"
        title={NOTCH_EMPTY_LINE}
        body={`${NOTCH_TABLE_LINE} Tape it when walkers still want the pits clipped. It does not drop the tote or mark it sold.`}
        actions={
          <Button
            variant="outline"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href={listingPath(listingId)} />}
          >
            Back to the listing
          </Button>
        }
      />
    </div>
  );
}
