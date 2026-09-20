import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_CHALK_EMPTY_COPY, BOOTH_CHALK_PAPER_LINE } from "@/lib/booth-chalk";
import { stallPath } from "@/lib/paths";

export function BoothChalkEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-chalk-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have chalk"
        title={BOOTH_CHALK_EMPTY_COPY}
        body={`${BOOTH_CHALK_PAPER_LINE} Nobody taped a chalk note on ${boothName} in this browser. Still a season. Still no lookbook.`}
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
