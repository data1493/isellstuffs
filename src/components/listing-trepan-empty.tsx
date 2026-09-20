import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { TREPAN_EMPTY_LINE, TREPAN_TABLE_LINE } from "@/lib/listing-trepan";
import { listingPath } from "@/lib/paths";

export function ListingTrepanEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-trepan-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Trepan not taped"
        title={TREPAN_EMPTY_LINE}
        body={`${TREPAN_TABLE_LINE} Tape it when walkers still want a shop annulus. It does not drop the tote or mark it sold.`}
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
