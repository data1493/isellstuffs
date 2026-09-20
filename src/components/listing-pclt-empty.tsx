import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { PCLT_EMPTY_LINE, PCLT_TABLE_LINE } from "@/lib/listing-pclt";
import { listingPath } from "@/lib/paths";

export function ListingPcltEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-pclt-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Pclt not taped"
        title={PCLT_EMPTY_LINE}
        body={`${PCLT_TABLE_LINE} Tape it when walkers still want a shop PCL 5 table. It does not drop the tote or mark it sold.`}
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
