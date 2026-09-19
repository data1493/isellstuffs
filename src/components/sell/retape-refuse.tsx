import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { sellDeskPath, sellNewPath } from "@/lib/paths";
import { retapeRefuseCopy } from "@/lib/seller-listing";

export function RetapeRefuse({ kind }: { kind: "fixture" | "missing" }) {
  const copy = retapeRefuseCopy(kind);

  return (
    <MallNotice
      tone="missing"
      eyebrow={copy.eyebrow}
      title={copy.title}
      body={copy.body}
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
            render={<Link href={sellNewPath()} />}
          >
            List something new
          </Button>
        </>
      }
    />
  );
}
