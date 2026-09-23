import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BACK_SOON_EMPTY_COPY, BACK_SOON_PAPER_LINE } from "@/lib/back-soon";
import { stallPath } from "@/lib/paths";

export function BackSoonEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-back-soon-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Back after lunch"
        title={BACK_SOON_EMPTY_COPY}
        body={`${BACK_SOON_PAPER_LINE} Nobody taped a lunch run on ${boothName} in this browser.`}
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
