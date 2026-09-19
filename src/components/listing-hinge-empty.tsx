import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { HINGE_EMPTY_LINE, HINGE_TABLE_LINE } from "@/lib/listing-hinge";
import { listingPath } from "@/lib/paths";

export function ListingHingeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-hinge-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Hinge is on"
        title={HINGE_EMPTY_LINE}
        body={`${HINGE_TABLE_LINE} Tape it when the jewel hinge already snapped. It does not drop the tote or mark it sold.`}
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
