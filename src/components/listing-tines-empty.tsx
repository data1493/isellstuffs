import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { TINES_EMPTY_LINE, TINES_TABLE_LINE } from "@/lib/listing-tines";
import { listingPath } from "@/lib/paths";

export function ListingTinesEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-tines-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Tines not taped"
        title={TINES_EMPTY_LINE}
        body={`${TINES_TABLE_LINE} Tape it when walkers still want a spare wire. It does not drop the tote or write a reshape.`}
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
