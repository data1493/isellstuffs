import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_THIMBLE_EMPTY_COPY,
  BOOTH_THIMBLE_PAPER_LINE,
} from "@/lib/booth-thimble";
import { stallPath } from "@/lib/paths";

export function BoothThimbleEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-thimble-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a thimble"
        title={BOOTH_THIMBLE_EMPTY_COPY}
        body={`${BOOTH_THIMBLE_PAPER_LINE} Nobody taped a thimble note on ${boothName} in this browser. Still a closet. Still worn twice.`}
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
