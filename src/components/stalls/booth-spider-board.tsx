import Link from "next/link";

import { BoothSpiderEmpty } from "@/app/stalls/[slug]/spider/empty";
import { BoothSpiderForm } from "@/components/stalls/booth-spider-form";
import { SyncBoothSpider } from "@/components/stalls/sync-booth-spider";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_SPIDER_EMPTY_TAPE,
  BOOTH_SPIDER_MIRROR_SCRIPT,
  BOOTH_SPIDER_PACKED_LEFTOVER,
  BOOTH_SPIDER_PAPER_LINE,
  type BoothSpiderMap,
  type BoothSpiderNote,
} from "@/lib/booth-spider";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothSpiderBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothSpiderMap;
  current?: BoothSpiderNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div data-booth-spider-state={current ? "taped" : "open"}>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SPIDER_MIRROR_SCRIPT }} />
      <SyncBoothSpider map={map} />

      <MallHero>
        <MallCrumb label="I don't have a spider">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Still Side A</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still Side A
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still a crate
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have a spider</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Still Side A.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_SPIDER_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            still want a 45 adapter, or to play their 45.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The spider note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have a spider.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have a spider. Still
                Side A. Still a crate. Clear deletes this booth only.
              </p>
            </div>
            <BoothSpiderForm
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
              deck, name, inners, or the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank spider note"
                title={BOOTH_SPIDER_EMPTY_TAPE}
                body="Empty tape does not stick. Write the spider note — I don't have a spider — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have a spider."
                body={
                  <div className="space-y-3">
                    <p data-booth-spider-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-spider-leftover="">
                        {BOOTH_SPIDER_PACKED_LEFTOVER}
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
              <BoothSpiderEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
