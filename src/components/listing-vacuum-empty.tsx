import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  VACUUM_EMPTY_LINE,
  VACUUM_TABLE_LINE,
} from "@/lib/listing-vacuum";
import { listingPath } from "@/lib/paths";

export function ListingVacuumEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-vacuum-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Vacuum not taped"
        title={VACUUM_EMPTY_LINE}
        body={`${VACUUM_TABLE_LINE} Tape it when walkers still want the groove wet-vacced. It does not drop the tote or mark it sold.`}
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
