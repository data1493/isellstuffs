import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { PRUSSIAN_EMPTY_LINE, PRUSSIAN_TABLE_LINE } from "@/lib/listing-prussian";
import { listingPath } from "@/lib/paths";

export function ListingPrussianEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-prussian-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Prussian not taped"
        title={PRUSSIAN_EMPTY_LINE}
        body={`${PRUSSIAN_TABLE_LINE} Tape it when walkers still want shop Prussian blue. It does not drop the tote or mark it sold.`}
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
