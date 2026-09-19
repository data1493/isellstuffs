import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_SHADE_EMPTY_COPY, BOOTH_SHADE_PAPER_LINE } from "@/lib/booth-shade";
import { stallPath } from "@/lib/paths";

export function BoothShadeEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-shade-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Keep it in the shade"
        title={BOOTH_SHADE_EMPTY_COPY}
        body={`${BOOTH_SHADE_PAPER_LINE} Nobody taped shade on ${boothName} in this browser. Rain is still Sunday if wet.`}
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
