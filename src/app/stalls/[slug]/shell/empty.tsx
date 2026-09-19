import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_SHELL_EMPTY_COPY, BOOTH_SHELL_PAPER_LINE } from "@/lib/booth-shell";
import { stallPath } from "@/lib/paths";

export function BoothShellEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-shell-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Don't open the shell"
        title={BOOTH_SHELL_EMPTY_COPY}
        body={`${BOOTH_SHELL_PAPER_LINE} Nobody taped a factory-seal note on ${boothName} in this browser. Wrap and poly stay their own paper.`}
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
