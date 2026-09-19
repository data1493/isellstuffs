import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { HANDLE_EMPTY_LINE, HANDLE_TABLE_LINE } from "@/lib/listing-handle";
import { listingPath } from "@/lib/paths";

export function ListingHandleEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-handle-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Handle not taped"
        title={HANDLE_EMPTY_LINE}
        body={`${HANDLE_TABLE_LINE} Tape it when walkers still want the mug handled. It does not drop the tote or mark it sold.`}
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
