import Link from "next/link";

import { BoothWickEmpty } from "@/app/stalls/[slug]/wick/empty";
import { BoothWickForm } from "@/components/stalls/booth-wick-form";
import { SyncBoothWick } from "@/components/stalls/sync-booth-wick";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_WICK_EMPTY_TAPE,
  BOOTH_WICK_MIRROR_SCRIPT,
  BOOTH_WICK_PACKED_LEFTOVER,
  BOOTH_WICK_PAPER_LINE,
  type BoothWickMap,
  type BoothWickNote,
} from "@/lib/booth-wick";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothWickBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothWickMap;
  current?: BoothWickNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div data-booth-wick-state={current ? "taped" : "open"}>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_WICK_MIRROR_SCRIPT }} />
      <SyncBoothWick map={map} />

      <MallHero>
        <MallCrumb label="I don't have a wick">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Still a table</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still a table
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still Half-Working
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have a wick</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Still a table.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_WICK_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            still want a wick, or so they can pull the fuse tin before they buy.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The wick note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have a wick.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have a wick. Still a
                table. Clear deletes this booth only.
              </p>
            </div>
            <BoothWickForm
              stallId={stall.id}
              slug={stall.slug}
              current={current}
            />
            <p className="text-sm leading-6 text-muted-foreground">
              The stall is still{" "}
              <Link
                href={stallPath(stall.slug)}
                className="underline underline-offset-4"
              >
                {stall.boothName}
              </Link>
              . The lot still says who set up. This note does not rewrite
              reflow, tin, driver, or the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank wick note"
                title={BOOTH_WICK_EMPTY_TAPE}
                body="Empty tape does not stick. Write the wick note — I don't have a wick — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have a wick."
                body={
                  <div className="space-y-3">
                    <p data-booth-wick-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-wick-leftover="">
                        {BOOTH_WICK_PACKED_LEFTOVER}
                      </p>
                    ) : null}
                  </div>
                }
              >
                <p className="text-sm text-muted-foreground">
                  <Link
                    href={lotPath()}
                    className="underline underline-offset-4"
                  >
                    See the lot
                  </Link>
                </p>
              </MallNotice>
            ) : emptyTape ? null : (
              <BoothWickEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
