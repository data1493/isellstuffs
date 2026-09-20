import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { MAT_EMPTY_LINE, MAT_TABLE_LINE } from "@/lib/listing-mat";
import { listingPath } from "@/lib/paths";

export function ListingMatEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-mat-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Mat not taped"
        title={MAT_EMPTY_LINE}
        body={`${MAT_TABLE_LINE} Tape it when walkers still want the copy-shop mount. It does not drop the tote or rewrite the file.`}
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
