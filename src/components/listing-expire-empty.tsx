import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { EXPIRE_EMPTY_LINE, EXPIRE_TABLE_LINE } from "@/lib/listing-expire";
import { listingPath } from "@/lib/paths";

export function ListingExpireEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-expire-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Open leftover"
        title={EXPIRE_EMPTY_LINE}
        body={`${EXPIRE_TABLE_LINE} Tape it when walkers still want a Saturday void, or make it die at noon. It does not drop the tote or rewrite the credit.`}
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
