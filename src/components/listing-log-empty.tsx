import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { LOG_EMPTY_LINE, LOG_TABLE_LINE } from "@/lib/listing-log";
import { listingPath } from "@/lib/paths";

export function ListingLogEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-log-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Log not taped"
        title={LOG_EMPTY_LINE}
        body={`${LOG_TABLE_LINE} Tape it when walkers still want the cubes unlogged. It does not drop the tote or rewrite the file.`}
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
