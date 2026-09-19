import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";

export function FolderEmpty() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Booth folder"
      title="No folder on this slip."
      body="This tab has no paid digital lines. Physical junk stays with the stall. File-gone listings do not get an envelope. Pay a file, then come back."
      actions={
        <>
          <Button className="rounded-full px-5" render={<Link href="/cart" />}>
            Back to tote
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/hubs/download-stall" />}
          >
            Download Stall
          </Button>
        </>
      }
    />
  );
}
