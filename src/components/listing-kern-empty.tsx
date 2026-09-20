import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { KERN_EMPTY_LINE, KERN_TABLE_LINE } from "@/lib/listing-kern";
import { listingPath } from "@/lib/paths";

export function ListingKernEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-kern-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Kern not taped"
        title={KERN_EMPTY_LINE}
        body={`${KERN_TABLE_LINE} Tape it when walkers still want the pairs tightened. It does not drop the tote or rewrite the file.`}
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
