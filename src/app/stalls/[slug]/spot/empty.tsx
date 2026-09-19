import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { MOVED_SPOT_EMPTY_COPY, MOVED_SPOT_PAPER_LINE } from "@/lib/moved-spot";
import { stallPath } from "@/lib/paths";

export function MovedSpotEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-moved-spot-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Moved two spots"
        title={MOVED_SPOT_EMPTY_COPY}
        body={`${MOVED_SPOT_PAPER_LINE} Nobody taped a gravel note on ${boothName} in this browser.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={stallPath(slug)} />}
          >
            Back to the stall
          </Button>
        }
      />
    </div>
  );
}
