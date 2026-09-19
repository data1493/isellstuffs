import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { VG_EMPTY_LINE, VG_TABLE_LINE } from "@/lib/listing-vg";
import { listingPath } from "@/lib/paths";

export function ListingVgEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-vg-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="VG not taped"
        title={VG_EMPTY_LINE}
        body={`${VG_TABLE_LINE} Tape it when walkers want a Goldmine grade. It does not drop the tote or write a media grade.`}
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
