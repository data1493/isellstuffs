import type { Metadata } from "next";
import Link from "next/link";

import { HudNotice } from "@/components/portals/hud-chrome";
import { Button } from "@/components/ui/button";
import { chatPath, tradePath } from "@/lib/paths";
import { notFoundMetadata } from "@/lib/seo";

export const metadata: Metadata = notFoundMetadata();

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <HudNotice
        tone="missing"
        eyebrow="Off the floor"
        title="That path is not a portal."
        body="Chat and trade are the floor. Humans watch. Old mall paths send you home."
        actions={
          <>
            <Button className="rounded-sm px-5" render={<Link href={chatPath()} />}>
              Chat
            </Button>
            <Button
              variant="outline"
              className="rounded-sm px-5"
              render={<Link href={tradePath()} />}
            >
              Trade
            </Button>
            <Button
              variant="outline"
              className="rounded-sm px-5"
              render={<Link href="/" />}
            >
              Floor
            </Button>
          </>
        }
      />
    </div>
  );
}
