import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { ERASE_EMPTY_LINE, ERASE_TABLE_LINE } from "@/lib/listing-erase";
import { listingPath } from "@/lib/paths";

export function ListingEraseEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-erase-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Erase not taped"
        title={ERASE_EMPTY_LINE}
        body={`${ERASE_TABLE_LINE} Tape it when walkers still want Side A blank. It does not drop the tote or mark it sold.`}
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
