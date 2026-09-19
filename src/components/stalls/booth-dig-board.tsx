import Link from "next/link";

import { BoothDigEmpty } from "@/app/stalls/[slug]/dig/empty";
import { BoothDigForm } from "@/components/stalls/booth-dig-form";
import { SyncBoothDig } from "@/components/stalls/sync-booth-dig";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_DIG_EMPTY_TAPE,
  BOOTH_DIG_MIRROR_SCRIPT,
  BOOTH_DIG_PACKED_LEFTOVER,
  BOOTH_DIG_PAPER_LINE,
  type BoothDigMap,
  type BoothDigNote,
} from "@/lib/booth-dig";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothDigBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothDigMap;
  current?: BoothDigNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_DIG_MIRROR_SCRIPT }} />
      <SyncBoothDig map={map} />

      <MallHero>
        <MallCrumb label="Don't dig under">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">The gravel</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Ask the table
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not the gravel
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Don&apos;t dig under</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            The zips are not in the gravel.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_DIG_PAPER_LINE} {stall.boothName} keeps this note. Van is more
            out back. Lost is sunglasses. Walkers still crawl under Sunday Crate.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The gravel note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                Ask what&apos;s on the table.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. Don&apos;t dig under. The zips are
                not in the gravel. Van is more out back. Lost is sunglasses.
                Clear deletes this booth only.
              </p>
            </div>
            <BoothDigForm
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
              . The lot still says who set up. This note does not rewrite van,
              lost, or poly.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank gravel note"
                title={BOOTH_DIG_EMPTY_TAPE}
                body="Empty tape does not stick. Write the gravel note — don't dig under — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="Don't dig under."
                body={
                  <div className="space-y-3">
                    <p data-booth-dig-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-dig-leftover="">
                        {BOOTH_DIG_PACKED_LEFTOVER}
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
              <BoothDigEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
