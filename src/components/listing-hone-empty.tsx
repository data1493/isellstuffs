import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { HONE_EMPTY_LINE, HONE_TABLE_LINE } from "@/lib/listing-hone";
import { listingPath } from "@/lib/paths";

export function ListingHoneEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-hone-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Hone not taped"
        title={HONE_EMPTY_LINE}
        body={`${HONE_TABLE_LINE} Tape it when walkers still want the nick stoned. It does not drop the tote or mark it sold.`}
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
