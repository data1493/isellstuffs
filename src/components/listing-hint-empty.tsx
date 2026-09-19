import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { HINT_EMPTY_LINE, HINT_TABLE_LINE } from "@/lib/listing-hint";
import { listingPath } from "@/lib/paths";

export function ListingHintEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-hint-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Two weights"
        title={HINT_EMPTY_LINE}
        body={`${HINT_TABLE_LINE} Tape it when walkers still want a hinted webfont. It does not drop the tote or rewrite the file.`}
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
