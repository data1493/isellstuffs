import Link from "next/link";

import { BoothTweezersEmpty } from "@/app/stalls/[slug]/tweezers/empty";
import { BoothTweezersForm } from "@/components/stalls/booth-tweezers-form";
import { SyncBoothTweezers } from "@/components/stalls/sync-booth-tweezers";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_TWEEZERS_EMPTY_TAPE,
  BOOTH_TWEEZERS_MIRROR_SCRIPT,
  BOOTH_TWEEZERS_PACKED_LEFTOVER,
  BOOTH_TWEEZERS_PAPER_LINE,
  type BoothTweezersMap,
  type BoothTweezersNote,
} from "@/lib/booth-tweezers";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothTweezersBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothTweezersMap;
  current?: BoothTweezersNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div data-booth-tweezers-state={current ? "taped" : "open"}>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_TWEEZERS_MIRROR_SCRIPT }} />
      <SyncBoothTweezers map={map} />

      <MallHero>
        <MallCrumb label="I don't have tweezers">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Still a driveway</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still a driveway
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still a crack
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still Half-Working
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have tweezers</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Still a driveway. Still a crack.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_TWEEZERS_PAPER_LINE} {stall.boothName} keeps this note.
            Walkers still want tweezers, or so they can lift the fused cart
            without Closet&apos;s snips.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The tweezers note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have tweezers.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have tweezers. Still a
                driveway. Still a crack. Clear deletes this booth only.
              </p>
            </div>
            <BoothTweezersForm
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
              snips, wick, spudger, or the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank tweezers note"
                title={BOOTH_TWEEZERS_EMPTY_TAPE}
                body="Empty tape does not stick. Write the tweezers note — I don't have tweezers — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have tweezers."
                body={
                  <div className="space-y-3">
                    <p data-booth-tweezers-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-tweezers-leftover="">
                        {BOOTH_TWEEZERS_PACKED_LEFTOVER}
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
              <BoothTweezersEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
