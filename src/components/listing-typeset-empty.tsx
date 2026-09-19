import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { TYPESET_EMPTY_LINE, TYPESET_TABLE_LINE } from "@/lib/listing-typeset";
import { listingPath } from "@/lib/paths";

export function ListingTypesetEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-typeset-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Still a folding-table page"
        title={TYPESET_EMPTY_LINE}
        body={`${TYPESET_TABLE_LINE} Tape it when walkers still want a Canva ebook. It does not drop the tote or rewrite the file.`}
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
