import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SATURATE_EMPTY_LINE, SATURATE_TABLE_LINE } from "@/lib/listing-saturate";
import { listingPath } from "@/lib/paths";

export function ListingSaturateEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-saturate-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Saturate not taped"
        title={SATURATE_EMPTY_LINE}
        body={`${SATURATE_TABLE_LINE} Tape it when walkers still want the kicks browned. It does not drop the tote or rewrite the file.`}
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
