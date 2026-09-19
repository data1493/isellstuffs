import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_WICK_EMPTY_COPY, BOOTH_WICK_PAPER_LINE } from "@/lib/booth-wick";
import { stallPath } from "@/lib/paths";

export function BoothWickEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-wick-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a wick"
        title={BOOTH_WICK_EMPTY_COPY}
        body={`${BOOTH_WICK_PAPER_LINE} Nobody taped a wick note on ${boothName} in this browser. Still a table.`}
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
