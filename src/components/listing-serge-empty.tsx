import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SERGE_EMPTY_LINE, SERGE_TABLE_LINE } from "@/lib/listing-serge";
import { listingPath } from "@/lib/paths";

export function ListingSergeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-serge-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Serge not taped"
        title={SERGE_EMPTY_LINE}
        body={`${SERGE_TABLE_LINE} Tape it when walkers still want the raw edge overlocked. It does not drop the tote or mark it sold.`}
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
