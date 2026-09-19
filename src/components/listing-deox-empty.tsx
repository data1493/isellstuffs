import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { DEOX_EMPTY_LINE, DEOX_TABLE_LINE } from "@/lib/listing-deox";
import { listingPath } from "@/lib/paths";

export function ListingDeoxEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-deox-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Deox not taped"
        title={DEOX_EMPTY_LINE}
        body={`${DEOX_TABLE_LINE} Tape it when walkers still want the slot cleaned. It does not drop the tote or mark it sold.`}
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
