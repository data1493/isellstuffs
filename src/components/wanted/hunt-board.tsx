import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { HuntEmpty } from "@/components/wanted/hunt-empty";
import { HuntForm } from "@/components/wanted/hunt-form";
import { HuntScrap } from "@/components/wanted/hunt-scrap";
import { SyncHunts } from "@/components/wanted/sync-hunts";
import { savedPath } from "@/lib/paths";
import type { Hunt } from "@/lib/wanted";

export function HuntBoard({
  hunts,
  emptyTape,
}: {
  hunts: Hunt[];
  emptyTape?: boolean;
}) {
  return (
    <div>
      <SyncHunts hunts={hunts} />

      <MallHero>
        <MallCrumb label="Hunt board">
          <CrumbSep />
          <span className="text-foreground">Hunt board</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Looking, not listing
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not the later pile
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Hunt board</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Tape what you need.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            A flea-market cork. Write the hunt and leave it on the board.
            This is not a listing, not the later pile, and not a watched
            table. Sellers still list on a stall.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The scrap</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                What are you looking for?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence. The mug, the lamp, the PDF. After you tape it,
                the board still has it when you come back.
              </p>
            </div>
            <HuntForm />
            <p className="text-sm leading-6 text-muted-foreground">
              Parked SKUs stay on the{" "}
              <Link href={savedPath()} className="underline underline-offset-4">
                later pile
              </Link>
              . This cork does not bag them.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank scrap"
                title="Tape a hunt or leave the cork."
                body="Empty tape does not stick. Write what you need — a diner mug, a wobbly lamp — then tape it."
              />
            ) : null}

            {hunts.length > 0 ? (
              hunts.map((hunt) => <HuntScrap key={hunt.id} hunt={hunt} />)
            ) : emptyTape ? null : (
              <HuntEmpty />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
