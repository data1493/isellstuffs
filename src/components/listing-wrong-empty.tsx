import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { WRONG_EMPTY_LINE, WRONG_TABLE_LINE } from "@/lib/listing-wrong";
import { listingPath } from "@/lib/paths";

export function ListingWrongEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-wrong-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="The liner"
        title={WRONG_EMPTY_LINE}
        body={`${WRONG_TABLE_LINE} Tape it when walkers ask for a clean reprint. It does not drop the tote or rewrite the file.`}
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
