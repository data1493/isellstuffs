import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_FEELER_EMPTY_COPY, BOOTH_FEELER_PAPER_LINE } from "@/lib/booth-feeler";
import { stallPath } from "@/lib/paths";

export function BoothFeelerEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-feeler-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a feeler"
        title={BOOTH_FEELER_EMPTY_COPY}
        body={`${BOOTH_FEELER_PAPER_LINE} Nobody taped a feeler note on ${boothName} in this browser. Still a crack. Still a stain.`}
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
