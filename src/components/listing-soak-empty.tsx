import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SOAK_EMPTY_LINE, SOAK_TABLE_LINE } from "@/lib/listing-soak";
import { listingPath } from "@/lib/paths";

export function ListingSoakEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-soak-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Soak not taped"
        title={SOAK_EMPTY_LINE}
        body={`${SOAK_TABLE_LINE} Tape it when walkers still want a shop soak hold. It does not drop the tote or mark it sold.`}
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
