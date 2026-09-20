import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { DASHPOT_EMPTY_LINE, DASHPOT_TABLE_LINE } from "@/lib/listing-dashpot";
import { listingPath } from "@/lib/paths";

export function ListingDashpotEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-dashpot-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Dashpot not taped"
        title={DASHPOT_EMPTY_LINE}
        body={`${DASHPOT_TABLE_LINE} Tape it when walkers still want shop damping. It does not drop the tote or mark it sold.`}
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
