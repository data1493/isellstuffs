import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BREAK_BILLS_EMPTY_COPY, BREAK_BILLS_PAPER_LINE } from "@/lib/break-bills";
import { stallPath } from "@/lib/paths";

export function BreakBillsEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-break-bills-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I can break a twenty"
        title={BREAK_BILLS_EMPTY_COPY}
        body={`${BREAK_BILLS_PAPER_LINE} Nobody taped change on ${boothName} in this browser.`}
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
