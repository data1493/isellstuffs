import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { VENT_EMPTY_LINE, VENT_TABLE_LINE } from "@/lib/listing-vent";
import { listingPath } from "@/lib/paths";

export function ListingVentEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-vent-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Vent not taped"
        title={VENT_EMPTY_LINE}
        body={`${VENT_TABLE_LINE} Tape it when walkers still want a steam hole. It does not drop the tote or mark it sold.`}
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
