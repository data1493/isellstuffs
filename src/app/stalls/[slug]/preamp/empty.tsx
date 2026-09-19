import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_PREAMP_EMPTY_COPY,
  BOOTH_PREAMP_PAPER_LINE,
} from "@/lib/booth-preamp";
import { stallPath } from "@/lib/paths";

export function BoothPreampEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-preamp-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a preamp"
        title={BOOTH_PREAMP_EMPTY_COPY}
        body={`${BOOTH_PREAMP_PAPER_LINE} Nobody taped a preamp note on ${boothName} in this browser. Still a crate. Still a table.`}
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
