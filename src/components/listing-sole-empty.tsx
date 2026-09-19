import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SOLE_EMPTY_LINE, SOLE_TABLE_LINE } from "@/lib/listing-sole";
import { listingPath } from "@/lib/paths";

export function ListingSoleEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-sole-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Resole not taped"
        title={SOLE_EMPTY_LINE}
        body={`${SOLE_TABLE_LINE} Tape it when walkers still want a cobbler. It does not drop the tote or mark it sold.`}
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
