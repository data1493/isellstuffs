import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { OPSZ_EMPTY_LINE, OPSZ_TABLE_LINE } from "@/lib/listing-opsz";
import { listingPath } from "@/lib/paths";

export function ListingOpszEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-opsz-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Opsz not taped"
        title={OPSZ_EMPTY_LINE}
        body={`${OPSZ_TABLE_LINE} Tape it when walkers still want a shop optical-size axis. It does not drop the tote or mark it sold.`}
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
