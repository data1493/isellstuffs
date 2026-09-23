import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { giftPath, sellDeskPath } from "@/lib/paths";

export function FolderTapeEmpty() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Folder tape"
      title="No files walked in this browser."
      body="Paid PDFs and other files show up here after a tote walks. Codes stay at the gift desk. Lamps stay on the driveway."
      actions={
        <>
          <Button
            className="rounded-full px-5"
            render={<Link href={sellDeskPath()} />}
          >
            Back to the desk
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/folder" />}
          >
            Buyer folder
          </Button>
        </>
      }
    />
  );
}

export function FolderTapeNotFiles() {
  return (
    <MallNotice
      tone="empty"
      eyebrow="Folder tape"
      title="Nothing landed in a folder. Codes stay at the gift desk. Lamps stay on the driveway."
      body="This browser only paid a lamp or a gift code. Files are the ones that walk into a booth folder."
      actions={
        <>
          <Button
            className="rounded-full px-5"
            render={<Link href={giftPath()} />}
          >
            Gift desk
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={sellDeskPath()} />}
          >
            Back to the desk
          </Button>
        </>
      }
    />
  );
}
