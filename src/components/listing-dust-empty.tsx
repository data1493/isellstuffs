import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { DUST_EMPTY_LINE, DUST_TABLE_LINE } from "@/lib/listing-dust";
import { listingPath } from "@/lib/paths";

export function ListingDustEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-dust-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Dust not taped"
        title={DUST_EMPTY_LINE}
        body={`${DUST_TABLE_LINE} Tape it when the furniture or LP already holds the dust. It does not drop the tote or mark it sold.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={listingPath(listingId)} />}
          >
            Back to the listing
          </Button>
        }
      />
    </div>
  );
}
