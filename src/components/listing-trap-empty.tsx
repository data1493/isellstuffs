import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { TRAP_EMPTY_LINE, TRAP_TABLE_LINE } from "@/lib/listing-trap";
import { listingPath } from "@/lib/paths";

export function ListingTrapEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-trap-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Trap not taped"
        title={TRAP_EMPTY_LINE}
        body={`${TRAP_TABLE_LINE} Tape it when walkers still want the knockout choked. It does not drop the tote or rewrite the file.`}
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
