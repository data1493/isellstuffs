import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { STRETCH_EMPTY_LINE, STRETCH_TABLE_LINE } from "@/lib/listing-stretch";
import { listingPath } from "@/lib/paths";

export function ListingStretchEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-stretch-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Stretch not taped"
        title={STRETCH_EMPTY_LINE}
        body={`${STRETCH_TABLE_LINE} Tape it when walkers still want them blocked to a 10. It does not drop the tote or mark it sold.`}
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
