import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { LATHE_EMPTY_LINE, LATHE_TABLE_LINE } from "@/lib/listing-lathe";
import { listingPath } from "@/lib/paths";

export function ListingLatheEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-lathe-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Lathe not taped"
        title={LATHE_EMPTY_LINE}
        body={`${LATHE_TABLE_LINE} Tape it when walkers still want the scratch lathed. It does not drop the tote or mark it sold.`}
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
