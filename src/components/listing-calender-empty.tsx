import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  CALENDER_EMPTY_LINE,
  CALENDER_TABLE_LINE,
} from "@/lib/listing-calender";
import { listingPath } from "@/lib/paths";

export function ListingCalenderEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-calender-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Calender not taped"
        title={CALENDER_EMPTY_LINE}
        body={`${CALENDER_TABLE_LINE} Tape it when walkers still want a shop hot-roll. It does not drop the tote or mark it sold.`}
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
