import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_PRINT_EMPTY_COPY, BOOTH_PRINT_PAPER_LINE } from "@/lib/booth-print";
import { stallPath } from "@/lib/paths";

export function BoothPrintEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-print-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't print"
        title={BOOTH_PRINT_EMPTY_COPY}
        body={`${BOOTH_PRINT_PAPER_LINE} Nobody taped a print note on ${boothName} in this browser. Burn is no disc. Stick is no email. The folder still delivers.`}
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
