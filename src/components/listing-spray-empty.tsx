import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SPRAY_EMPTY_LINE, SPRAY_TABLE_LINE } from "@/lib/listing-spray";
import { listingPath } from "@/lib/paths";

export function ListingSprayEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-spray-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Spray not taped"
        title={SPRAY_EMPTY_LINE}
        body={`${SPRAY_TABLE_LINE} Tape it when walkers still want Scotchgard. It does not drop the tote or mark it sold.`}
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
