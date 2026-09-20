import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { DAM_EMPTY_LINE, DAM_TABLE_LINE } from "@/lib/listing-dam";
import { listingPath } from "@/lib/paths";

export function ListingDamEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-dam-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Dam not taped"
        title={DAM_EMPTY_LINE}
        body={`${DAM_TABLE_LINE} Tape it when walkers still want shop dam walls. It does not drop the tote or mark it sold.`}
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
