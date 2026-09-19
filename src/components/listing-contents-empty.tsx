import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  CONTENTS_EMPTY_LINE,
  CONTENTS_TABLE_LINE,
} from "@/lib/listing-contents";
import { listingPath } from "@/lib/paths";

export function ListingContentsEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-contents-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Contents not taped"
        title={CONTENTS_EMPTY_LINE}
        body={`${CONTENTS_TABLE_LINE} Tape it when walkers still want what’s on BEATS 07. It does not drop the tote or mark it sold.`}
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
