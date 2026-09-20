import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_FUME_EMPTY_COPY, BOOTH_FUME_PAPER_LINE } from "@/lib/booth-fume";
import { stallPath } from "@/lib/paths";

export function BoothFumeEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-fume-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a fume"
        title={BOOTH_FUME_EMPTY_COPY}
        body={`${BOOTH_FUME_PAPER_LINE} Nobody taped a fume note on ${boothName} in this browser. Still a driveway. Still no bench.`}
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
