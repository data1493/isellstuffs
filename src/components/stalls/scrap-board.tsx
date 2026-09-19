import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { ScrapEmpty } from "@/components/stalls/scrap-empty";
import { ScrapForm } from "@/components/stalls/scrap-form";
import { ScrapNote } from "@/components/stalls/scrap-note";
import { SyncScraps } from "@/components/stalls/sync-scraps";
import { Badge } from "@/components/ui/badge";
import type { Stall } from "@/lib/commerce";
import { stallPath } from "@/lib/paths";
import {
  SCRAP_PAPER_LINE,
  SCRAP_RELOAD_LINE,
  type StallScrap,
} from "@/lib/stall-scrap";

export function ScrapBoard({
  stall,
  scraps,
  emptyTape,
}: {
  stall: Stall;
  scraps: StallScrap[];
  emptyTape?: boolean;
}) {
  return (
    <div>
      <SyncScraps scraps={scraps} />

      <MallHero>
        <MallCrumb label="Table scrap">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Scrap</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Sticky on this table
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a hunt
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Booth scrap</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Tape a sticky on this table.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {SCRAP_PAPER_LINE} {SCRAP_RELOAD_LINE} {stall.boothName} keeps the
            note on this cork.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The sticky</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                What should this booth say?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for the table. Cash only after 2. Back in ten.
                After you tape it, the scrap is still here when you reload.
              </p>
            </div>
            <ScrapForm slug={stall.slug} />
            <p className="text-sm leading-6 text-muted-foreground">
              The stall is still{" "}
              <Link
                href={stallPath(stall.slug)}
                className="underline underline-offset-4"
              >
                {stall.boothName}
              </Link>
              . This scrap does not list a SKU or change the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank scrap"
                title="Tape a note or leave the table."
                body="Empty tape does not stick. Write the sticky — cash only after 2 — then tape it."
              />
            ) : null}

            {scraps.length > 0 ? (
              scraps.map((scrap) => (
                <ScrapNote key={scrap.id} scrap={scrap} slug={stall.slug} />
              ))
            ) : emptyTape ? null : (
              <ScrapEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
