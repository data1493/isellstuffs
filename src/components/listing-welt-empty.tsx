import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { WELT_EMPTY_LINE, WELT_TABLE_LINE } from "@/lib/listing-welt";
import { listingPath } from "@/lib/paths";

export function ListingWeltEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-welt-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Welt not taped"
        title={WELT_EMPTY_LINE}
        body={`${WELT_TABLE_LINE} Tape it when walkers still want the pair welted. It does not drop the tote or mark it sold.`}
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
