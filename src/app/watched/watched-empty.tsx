import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallHero, MallWidth } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { stallPath } from "@/lib/paths";

export function WatchedEmpty({ packed }: { packed?: boolean }) {
  return (
    <div>
      <MallHero>
        <MallCrumb label="Watched tables">
          <CrumbSep />
          <span className="text-foreground">Watched tables</span>
        </MallCrumb>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full">
            Booths, not SKUs.
          </Badge>
        </div>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Watched tables
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Same folding tables. Next weekend.
          </p>
        </div>
      </MallHero>
      <MallWidth className="flex flex-col gap-6 py-12 sm:py-16">
        {packed ? (
          <MallNotice
            padded={false}
            tone="missing"
            titleAs="h2"
            eyebrow="Not on the map"
            title="That stall packed up."
            body="No booth with that id. The folding table is gone, or the name is wrong."
          />
        ) : null}
        <MallNotice
          padded={false}
          tone="empty"
          eyebrow="Watched tables"
          title="You are not walking any table twice. Open a stall and mark it."
          body="This is not the later pile. Mark a booth from its stall page. Cold or blocked storage looks the same — not a crash."
          actions={
            <>
              <Button
                className="rounded-full px-5"
                render={<Link href={stallPath("folding-table-tuesday")} />}
              >
                Open Folding Table Tuesday
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
