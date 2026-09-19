import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { FERRITE_EMPTY_LINE, FERRITE_TABLE_LINE } from "@/lib/listing-ferrite";
import { listingPath } from "@/lib/paths";

export function ListingFerriteEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-ferrite-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Ferrite not taped"
        title={FERRITE_EMPTY_LINE}
        body={`${FERRITE_TABLE_LINE} Tape it when walkers still want the drawer ferrited. It does not drop the tote or mark it sold.`}
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
