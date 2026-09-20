import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SQUEEGEE_EMPTY_LINE, SQUEEGEE_TABLE_LINE } from "@/lib/listing-squeegee";
import { listingPath } from "@/lib/paths";

export function ListingSqueegeeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-squeegee-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Squeegee not taped"
        title={SQUEEGEE_EMPTY_LINE}
        body={`${SQUEEGEE_TABLE_LINE} Tape it when walkers still want shop paste pulled. It does not drop the tote or mark it sold.`}
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
