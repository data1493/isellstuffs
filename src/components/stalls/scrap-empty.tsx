import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { stallPath } from "@/lib/paths";
import { SCRAP_EMPTY_COPY } from "@/lib/stall-scrap";

export function ScrapEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <MallNotice
      tone="empty"
      padded={false}
      titleAs="h2"
      eyebrow="Table scrap"
      title={SCRAP_EMPTY_COPY}
      body={`Nobody taped a sticky on ${boothName} in this browser. Write the note — cash only after 2 — and leave it on the table.`}
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
  );
}
