import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CLIP_EMPTY_LINE, CLIP_TABLE_LINE } from "@/lib/listing-clip";
import { listingPath } from "@/lib/paths";

export function ListingClipEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-clip-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Clip still on"
        title={CLIP_EMPTY_LINE}
        body={`${CLIP_TABLE_LINE} Tape it when the binder clip walked off the recipe stack. It does not drop the tote or rewrite the file.`}
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
