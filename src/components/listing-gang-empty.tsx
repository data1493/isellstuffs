import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { GANG_EMPTY_LINE, GANG_TABLE_LINE } from "@/lib/listing-gang";
import { listingPath } from "@/lib/paths";

export function ListingGangEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-gang-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Gang not taped"
        title={GANG_EMPTY_LINE}
        body={`${GANG_TABLE_LINE} Tape it when walkers still want the three cards ganged. It does not drop the tote or rewrite the file. Print imposition, not a login.`}
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
