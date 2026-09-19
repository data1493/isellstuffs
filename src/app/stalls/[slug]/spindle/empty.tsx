import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_SPINDLE_EMPTY_COPY,
  BOOTH_SPINDLE_PAPER_LINE,
} from "@/lib/booth-spindle";
import { stallPath } from "@/lib/paths";

export function BoothSpindleEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-spindle-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a spindle"
        title={BOOTH_SPINDLE_EMPTY_COPY}
        body={`${BOOTH_SPINDLE_PAPER_LINE} Nobody taped a spindle note on ${boothName} in this browser. Still a jewel.`}
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
