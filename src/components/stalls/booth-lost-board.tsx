import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { BoothLostEmpty } from "@/components/stalls/booth-lost-empty";
import { BoothLostForm } from "@/components/stalls/booth-lost-form";
import { BoothLostTitle } from "@/components/stalls/booth-lost-title";
import { SyncBoothLost } from "@/components/stalls/sync-booth-lost";
import { Badge } from "@/components/ui/badge";
import type { Stall } from "@/lib/commerce";
import {
  LOST_PAPER_LINE,
  LOST_RELOAD_LINE,
  type LostTitle,
} from "@/lib/booth-lost";
import { stallPath } from "@/lib/paths";

export function BoothLostBoard({
  stall,
  titles,
  emptyTape,
}: {
  stall: Stall;
  titles: LostTitle[];
  emptyTape?: boolean;
}) {
  return (
    <div data-booth-lost="board" data-booth-lost-stall={stall.slug}>
      <SyncBoothLost titles={titles} />

      <MallHero>
        <MallCrumb label="Lost">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Lost</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Left behind
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not free
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Lost</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Someone left sunglasses on the pile.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {LOST_PAPER_LINE} {LOST_RELOAD_LINE} {stall.boothName} keeps this
            pile. Other booths keep theirs.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The pile</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                What was left on this booth?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One title. Green sunglasses. A cracked case under the
                windbreakers. After you tape it, the pile is still here when
                you reload. Twenty titles on this booth is the lid.
              </p>
            </div>
            <BoothLostForm slug={stall.slug} />
            <p className="text-sm leading-6 text-muted-foreground">
              The stall is still{" "}
              <Link
                href={stallPath(stall.slug)}
                className="underline underline-offset-4"
              >
                {stall.boothName}
              </Link>
              . This pile does not list a SKU, change a tag, or bag the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank title"
                title="Tape a title or leave the pile."
                body="Empty tape does not stick. Write the title — green sunglasses — then tape it."
              />
            ) : null}

            {titles.length > 0 ? (
              titles.map((item) => (
                <BoothLostTitle key={item.id} item={item} slug={stall.slug} />
              ))
            ) : emptyTape ? null : (
              <BoothLostEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
