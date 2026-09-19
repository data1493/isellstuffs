import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_LAST_EMPTY_COPY, BOOTH_LAST_PAPER_LINE } from "@/lib/booth-last";
import { stallPath } from "@/lib/paths";

export function BoothLastEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-last-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a last"
        title={BOOTH_LAST_EMPTY_COPY}
        body={`${BOOTH_LAST_PAPER_LINE} Nobody taped a last note on ${boothName} in this browser. Still a table.`}
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
