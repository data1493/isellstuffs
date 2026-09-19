import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { MASTER_EMPTY_LINE, MASTER_TABLE_LINE } from "@/lib/listing-master";
import { listingPath } from "@/lib/paths";

export function ListingMasterEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-master-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Master not taped"
        title={MASTER_EMPTY_LINE}
        body={`${MASTER_TABLE_LINE} Tape it when walkers still want the session folder. It does not drop the tote or mark it sold.`}
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
