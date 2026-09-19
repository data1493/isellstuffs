import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { PEEN_EMPTY_LINE, PEEN_TABLE_LINE } from "@/lib/listing-peen";
import { listingPath } from "@/lib/paths";

export function ListingPeenEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-peen-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Peen not taped"
        title={PEEN_EMPTY_LINE}
        body={`${PEEN_TABLE_LINE} Tape it when walkers still want the collar hammered. It does not drop the tote or mark it sold.`}
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
