import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { DUMP_EMPTY_LINE, DUMP_TABLE_LINE } from "@/lib/listing-dump";
import { listingPath } from "@/lib/paths";

export function ListingDumpEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-dump-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Dump not taped"
        title={DUMP_EMPTY_LINE}
        body={`${DUMP_TABLE_LINE} Tape it when walkers still want a ROM. It does not drop the tote or mark it sold.`}
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
