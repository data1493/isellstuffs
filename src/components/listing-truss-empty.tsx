import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { TRUSS_EMPTY_LINE, TRUSS_TABLE_LINE } from "@/lib/listing-truss";
import { listingPath } from "@/lib/paths";

export function ListingTrussEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-truss-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Truss not taped"
        title={TRUSS_EMPTY_LINE}
        body={`${TRUSS_TABLE_LINE} Tape it when walkers still want the balloon tied. It does not drop the tote or mark it sold.`}
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
