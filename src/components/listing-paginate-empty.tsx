import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  PAGINATE_EMPTY_LINE,
  PAGINATE_TABLE_LINE,
} from "@/lib/listing-paginate";
import { listingPath } from "@/lib/paths";

export function ListingPaginateEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-paginate-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Paginate not taped"
        title={PAGINATE_EMPTY_LINE}
        body={`${PAGINATE_TABLE_LINE} Tape it when walkers still want more than one page. It does not drop the tote or rewrite the file.`}
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
