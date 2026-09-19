import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SPLICE_EMPTY_LINE, SPLICE_TABLE_LINE } from "@/lib/listing-splice";
import { listingPath } from "@/lib/paths";

export function ListingSpliceEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-splice-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Splice not taped"
        title={SPLICE_EMPTY_LINE}
        body={`${SPLICE_TABLE_LINE} Tape it when walkers still want the talkover cut. It does not drop the tote or mark it sold.`}
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
