import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { STEMS_EMPTY_LINE, STEMS_TABLE_LINE } from "@/lib/listing-stems";
import { listingPath } from "@/lib/paths";

export function ListingStemsEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-stems-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Shot count"
        title={STEMS_EMPTY_LINE}
        body={`${STEMS_TABLE_LINE} Tape it when walkers ask for a stem kit. It does not drop the tote or rewrite the file.`}
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
