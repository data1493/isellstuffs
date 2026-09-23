import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { stallPath } from "@/lib/paths";
import {
  TABLE_SHARE_EMPTY_COPY,
  TABLE_SHARE_PAPER_LINE,
} from "@/lib/table-share";

export function TableShareEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-table-share-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Sharing this table"
        title={TABLE_SHARE_EMPTY_COPY}
        body={`${TABLE_SHARE_PAPER_LINE} Nobody taped a sharer on ${boothName} in this browser. SKUs stay with their stall.`}
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
