"use client";

import Link from "next/link";

import { HudNotice } from "@/components/portals/hud-chrome";
import { Button } from "@/components/ui/button";
import { chatPath, tradePath } from "@/lib/paths";

export function PortalError({
  reset,
  eyebrow,
  title,
  body,
}: {
  reset: () => void;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <HudNotice
        tone="error"
        eyebrow={eyebrow}
        title={title}
        body={body}
        actions={
          <>
            <Button className="rounded-sm px-5" onClick={reset}>
              Try again
            </Button>
            <Button
              variant="outline"
              className="rounded-sm px-5"
              render={<Link href={chatPath()} />}
            >
              Chat
            </Button>
            <Button
              variant="outline"
              className="rounded-sm px-5"
              render={<Link href={tradePath()} />}
            >
              Trade
            </Button>
          </>
        }
      />
    </div>
  );
}
