import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_HARP_EMPTY_COPY, BOOTH_HARP_PAPER_LINE } from "@/lib/booth-harp";
import { stallPath } from "@/lib/paths";

export function BoothHarpEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-harp-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a harp"
        title={BOOTH_HARP_EMPTY_COPY}
        body={`${BOOTH_HARP_PAPER_LINE} Nobody taped a harp note on ${boothName} in this browser. The shade stays in the carton.`}
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
