import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallHero, MallWidth } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { lotPath, stallPath, watchedPath } from "@/lib/paths";

export function WalkEmpty({ packedAway }: { packedAway?: boolean }) {
  return (
    <div data-walk-empty="">
      <MallHero>
        <MallCrumb label="Saturday morning walk">
          <CrumbSep />
          <span className="text-foreground">Saturday walk</span>
        </MallCrumb>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full">
            This Saturday
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not the lot map
          </Badge>
        </div>
        <div className="max-w-2xl space-y-3">
          <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
            Saturday morning walk
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Tables you marked. Hours for this weekend. Packed booths stay in
            the car.
          </p>
        </div>
      </MallHero>
      <MallWidth className="flex flex-col gap-6 py-12 sm:py-16">
        <MallNotice
          padded={false}
          tone="empty"
          eyebrow="Saturday walk"
          title={
            packedAway
              ? "The tables you marked went in the car."
              : "Nothing on this Saturday walk."
          }
          body={
            packedAway
              ? "Packed booths stay off the scrap. Mark another table, or wait until they set back up."
              : "Mark a booth from its stall page. This scrap only lists watched tables that are still out."
          }
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
                render={<Link href={watchedPath()} />}
              >
                Watched tables
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-5"
                render={<Link href={lotPath()} />}
              >
                Who set up
              </Button>
            </>
          }
        />
      </MallWidth>
    </div>
  );
}
