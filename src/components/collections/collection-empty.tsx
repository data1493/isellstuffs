import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import type { Collection } from "@/lib/collections";
import { collectionsPath } from "@/lib/paths";

export function CollectionEmpty({ collection }: { collection: Collection }) {
  return (
    <MallNotice
      tone="empty"
      eyebrow={collection.eyebrow}
      title={`${collection.name} is empty.`}
      body="Sold and file-gone do not get a second life on a rack. Walk the concourse, or try another taped theme."
      actions={
        <>
          <Button
            className="rounded-full px-5"
            render={<Link href={collectionsPath()} />}
          >
            Other racks
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/explore" />}
          >
            Explore the concourse
          </Button>
        </>
      }
    />
  );
}

export function CollectionMissing() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Not on the map"
      title="That rack was never taped."
      body="Collections are opinions, not aisles. Under a ten, files tonight, and tested kinda are the racks we lined up."
      actions={
        <>
          <Button
            className="rounded-full px-5"
            render={<Link href={collectionsPath()} />}
          >
            See the racks
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/explore" />}
          >
            Explore the concourse
          </Button>
        </>
      }
    />
  );
}
