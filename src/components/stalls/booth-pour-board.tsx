import Link from "next/link";

import { BoothPourEmpty } from "@/app/stalls/[slug]/pour/empty";
import { BoothPourForm } from "@/components/stalls/booth-pour-form";
import { SyncBoothPour } from "@/components/stalls/sync-booth-pour";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_POUR_EMPTY_TAPE,
  BOOTH_POUR_MIRROR_SCRIPT,
  BOOTH_POUR_PACKED_LEFTOVER,
  BOOTH_POUR_PAPER_LINE,
  type BoothPourMap,
  type BoothPourNote,
} from "@/lib/booth-pour";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothPourBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothPourMap;
  current?: BoothPourNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_POUR_MIRROR_SCRIPT }} />
      <SyncBoothPour map={map} />

      <MallHero>
        <MallCrumb label="I don't pour">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">The empty mug</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            The mug is empty
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a diner
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t pour</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            The mug is empty.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_POUR_PAPER_LINE} {stall.boothName} keeps this note. Heat is
            the microwave. Chip is the diner rim. Walkers still want a pour.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The pour note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t pour.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t pour. The mug is
                empty. Not a diner. Not heat. Not whose. Clear deletes this
                booth only.
              </p>
            </div>
            <BoothPourForm
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
              . The lot still says who set up. This note does not rewrite heat,
              chip, or match.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank pour note"
                title={BOOTH_POUR_EMPTY_TAPE}
                body="Empty tape does not stick. Write the pour note — I don't pour — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't pour."
                body={
                  <div className="space-y-3">
                    <p data-booth-pour-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-pour-leftover="">
                        {BOOTH_POUR_PACKED_LEFTOVER}
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
              <BoothPourEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
