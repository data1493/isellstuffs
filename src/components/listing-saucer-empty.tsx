import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SAUCER_EMPTY_LINE, SAUCER_TABLE_LINE } from "@/lib/listing-saucer";
import { listingPath } from "@/lib/paths";

export function ListingSaucerEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-saucer-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Saucer not taped"
        title={SAUCER_EMPTY_LINE}
        body={`${SAUCER_TABLE_LINE} Tape it when walkers still want a diner plate, or a set. It does not drop the tote or mark it sold.`}
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
