import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_COPY_EMPTY_COPY, BOOTH_COPY_PAPER_LINE } from "@/lib/booth-copy";
import { stallPath } from "@/lib/paths";

export function BoothCopyEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-copy-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I will not copy onto your stick"
        title={BOOTH_COPY_EMPTY_COPY}
        body={`${BOOTH_COPY_PAPER_LINE} Nobody taped a copy note on ${boothName} in this browser. Folder after pay. Not a copy booth.`}
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
