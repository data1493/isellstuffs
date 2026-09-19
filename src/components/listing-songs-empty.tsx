import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SONGS_EMPTY_LINE, SONGS_TABLE_LINE } from "@/lib/listing-songs";
import { listingPath } from "@/lib/paths";

export function ListingSongsEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-songs-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Songs not taped"
        title={SONGS_EMPTY_LINE}
        body={`${SONGS_TABLE_LINE} Tape it when the cassette has no titles. It does not drop the tote or write a tracklist.`}
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
