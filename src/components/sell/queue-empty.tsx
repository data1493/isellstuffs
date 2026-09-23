import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { folderHasDigitalLines } from "@/lib/digital-folder";
import { folderPath, pickupPath, sellDeskPath } from "@/lib/paths";

export function QueueEmpty() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Driveway queue"
      title="No handoffs in this browser."
      body="Paid physical lines show up here after a tote walks. Files stay in the folder. The mall does not ship."
      actions={
        <>
          <Button
            className="rounded-full px-5"
            render={<Link href={sellDeskPath()} />}
          >
            Back to the desk
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={pickupPath()} />}
          >
            Buyer pickup slip
          </Button>
        </>
      }
    />
  );
}

export function QueueDigitalOnly({
  listingIds,
  slip,
}: {
  listingIds: string[];
  slip?: string;
}) {
  const showFolder = Boolean(slip && folderHasDigitalLines(listingIds));

  return (
    <MallNotice
      tone="empty"
      eyebrow="Driveway queue"
      title="Nobody is coming up the drive. Files stay in the folder."
      body="This browser only paid files or a gift code. There is no driveway hour. The mall does not ship."
      actions={
        <>
          {showFolder && slip ? (
            <Button
              className="rounded-full px-5"
              render={<Link href={folderPath(slip)} />}
            >
              Open the folder
            </Button>
          ) : null}
          <Button
            variant={showFolder ? "outline" : undefined}
            className="rounded-full px-5"
            render={<Link href={sellDeskPath()} />}
          >
            Back to the desk
          </Button>
        </>
      }
    />
  );
}
