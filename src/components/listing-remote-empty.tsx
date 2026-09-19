import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { REMOTE_EMPTY_LINE, REMOTE_TABLE_LINE } from "@/lib/listing-remote";
import { listingPath } from "@/lib/paths";

export function ListingRemoteEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-remote-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Clicker is in"
        title={REMOTE_EMPTY_LINE}
        body={`${REMOTE_TABLE_LINE} Tape it when the clicker walked. It does not drop the tote or mark it sold.`}
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
