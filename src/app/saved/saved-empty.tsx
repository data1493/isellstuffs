import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallHero, MallWidth } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listingPath } from "@/lib/paths";
import type { SavedBagNotice } from "@/lib/saved-bag";

export function SavedEmpty({ bag }: { bag?: SavedBagNotice }) {
  return (
    <div>
      <MallHero>
        <MallCrumb label="Later pile">
          <CrumbSep />
          <span className="text-foreground">Later pile</span>
        </MallCrumb>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full">
            Parked, not paid.
          </Badge>
        </div>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Later pile
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Park a lamp or a PDF while you walk the next aisle. This is not the
            tote.
          </p>
        </div>
      </MallHero>
      <MallWidth className="py-12 sm:py-16">
        <MallNotice
          padded={false}
          tone="empty"
          eyebrow="Later pile"
          title={
            bag === "empty"
              ? "Nothing still here to bag."
              : "Nothing in the later pile."
          }
          body={
            bag === "empty"
              ? "The pile is empty. Saving still does not bag. Cold or blocked storage looks the same — not a crash."
              : "Park a listing from its page. Saving does not put it in the tote. Cold or blocked storage looks the same — not a crash."
          }
          actions={
            <>
              <Button
                className="rounded-full px-5"
                render={<Link href={listingPath("ysk-wobbly-lamp")} />}
              >
                Open a listing
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-5"
                render={<Link href="/explore" />}
              >
                Walk the concourse
              </Button>
            </>
          }
        />
      </MallWidth>
    </div>
  );
}
