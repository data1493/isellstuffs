import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_LIFTER_EMPTY_COPY, BOOTH_LIFTER_PAPER_LINE } from "@/lib/booth-lifter";
import { stallPath } from "@/lib/paths";

export function BoothLifterEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-lifter-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a lifter"
        title={BOOTH_LIFTER_EMPTY_COPY}
        body={`${BOOTH_LIFTER_PAPER_LINE} Nobody taped a lifter note on ${boothName} in this browser. Still a crate. Still a skip.`}
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
