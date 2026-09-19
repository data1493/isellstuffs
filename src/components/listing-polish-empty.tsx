import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { POLISH_EMPTY_LINE, POLISH_TABLE_LINE } from "@/lib/listing-polish";
import { listingPath } from "@/lib/paths";

export function ListingPolishEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-polish-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Polish not taped"
        title={POLISH_EMPTY_LINE}
        body={`${POLISH_TABLE_LINE} Tape it when walkers still want Beats to make the scratch go. It does not drop the tote or mark it sold.`}
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
