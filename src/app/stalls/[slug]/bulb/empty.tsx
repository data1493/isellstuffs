import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_BULB_EMPTY_COPY, BOOTH_BULB_PAPER_LINE } from "@/lib/booth-bulb";
import { stallPath } from "@/lib/paths";

export function BoothBulbEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-bulb-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a bulb"
        title={BOOTH_BULB_EMPTY_COPY}
        body={`${BOOTH_BULB_PAPER_LINE} Nobody taped a bulb note on ${boothName} in this browser. Twist is the neck. Cord is the rewire. Box is the shade.`}
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
