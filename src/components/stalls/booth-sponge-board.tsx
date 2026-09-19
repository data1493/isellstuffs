import Link from "next/link";

import { BoothSpongeEmpty } from "@/app/stalls/[slug]/sponge/empty";
import { BoothSpongeForm } from "@/components/stalls/booth-sponge-form";
import { SyncBoothSponge } from "@/components/stalls/sync-booth-sponge";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_SPONGE_EMPTY_TAPE,
  BOOTH_SPONGE_MIRROR_SCRIPT,
  BOOTH_SPONGE_PACKED_LEFTOVER,
  BOOTH_SPONGE_PAPER_LINE,
  type BoothSpongeMap,
  type BoothSpongeNote,
} from "@/lib/booth-sponge";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothSpongeBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothSpongeMap;
  current?: BoothSpongeNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div data-booth-sponge-state={current ? "taped" : "open"}>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SPONGE_MIRROR_SCRIPT }} />
      <SyncBoothSponge map={map} />

      <MallHero>
        <MallCrumb label="I don't have a sponge">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Still dishes. Still a hose</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still dishes
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still a hose
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have a sponge</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Still dishes. Still a hose.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_SPONGE_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            still want a sponge at the hose.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The sponge note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have a sponge.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have a sponge. Still
                dishes. Still a hose. Clear deletes this booth only.
              </p>
            </div>
            <BoothSpongeForm
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
              dishes, pour, or the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank sponge note"
                title={BOOTH_SPONGE_EMPTY_TAPE}
                body="Empty tape does not stick. Write the sponge note — I don't have a sponge — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have a sponge."
                body={
                  <div className="space-y-3">
                    <p data-booth-sponge-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-sponge-leftover="">
                        {BOOTH_SPONGE_PACKED_LEFTOVER}
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
              <BoothSpongeEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
