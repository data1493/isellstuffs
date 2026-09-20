import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CUE_EMPTY_LINE, CUE_TABLE_LINE } from "@/lib/listing-cue";
import { listingPath } from "@/lib/paths";

export function ListingCueEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-cue-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Cue not taped"
        title={CUE_EMPTY_LINE}
        body={`${CUE_TABLE_LINE} Tape it when walkers still want a shop sheet. It does not drop the tote or mark it sold.`}
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
