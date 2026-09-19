import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOK_EMPTY_LINE, BOOK_TABLE_LINE } from "@/lib/listing-book";
import { listingPath } from "@/lib/paths";

export function ListingBookEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-book-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Booklet still in it"
        title={BOOK_EMPTY_LINE}
        body={`${BOOK_TABLE_LINE} Tape it when the liner notes walked. It does not drop the tote or empty the jewel.`}
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
