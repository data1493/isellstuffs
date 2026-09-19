import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SHOT_EMPTY_LINE, SHOT_TABLE_LINE } from "@/lib/listing-shot";
import { listingPath } from "@/lib/paths";

export function ListingShotEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-shot-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Open to shoot"
        title={SHOT_EMPTY_LINE}
        body={`${SHOT_TABLE_LINE} Tape it when walkers still want Half-Working to film the lot. It does not drop the tote or rewrite the file.`}
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
