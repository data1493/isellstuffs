import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { EARLY_FOLD_EMPTY_COPY, EARLY_FOLD_PAPER_LINE } from "@/lib/early-fold";
import { stallPath } from "@/lib/paths";

export function EarlyFoldEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-early-fold-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Folding up at noon"
        title={EARLY_FOLD_EMPTY_COPY}
        body={`${EARLY_FOLD_PAPER_LINE} Nobody taped a last-call note on ${boothName} in this browser.`}
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
