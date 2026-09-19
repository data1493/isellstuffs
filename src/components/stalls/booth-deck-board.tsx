import Link from "next/link";

import { BoothDeckEmpty } from "@/app/stalls/[slug]/deck/empty";
import { BoothDeckForm } from "@/components/stalls/booth-deck-form";
import { SyncBoothDeck } from "@/components/stalls/sync-booth-deck";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_DECK_EMPTY_TAPE,
  BOOTH_DECK_MIRROR_SCRIPT,
  BOOTH_DECK_PACKED_LEFTOVER,
  BOOTH_DECK_PAPER_LINE,
  type BoothDeckMap,
  type BoothDeckNote,
} from "@/lib/booth-deck";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothDeckBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothDeckMap;
  current?: BoothDeckNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_DECK_MIRROR_SCRIPT }} />
      <SyncBoothDeck map={map} />

      <MallHero>
        <MallCrumb label="I don't have a deck">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Spin it at home</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Cue at home
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a play count
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have a deck</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Spin it at home.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_DECK_PAPER_LINE} {stall.boothName} keeps this note. Plays is
            I already spun it. Skip is the scratch. Walkers still ask Sunday
            Crate to cue the LP.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The deck note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have a turntable.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have a deck. Spin it
                at home. Plays is I already spun it. Skip is the scratch. Not
                plays. Not skip. Not a cue. Clear deletes this booth only.
              </p>
            </div>
            <BoothDeckForm
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
              plays, skip, or the leftover disc.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank deck note"
                title={BOOTH_DECK_EMPTY_TAPE}
                body="Empty tape does not stick. Write the deck note — I don't have a deck — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have a deck."
                body={
                  <div className="space-y-3">
                    <p data-booth-deck-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-deck-leftover="">
                        {BOOTH_DECK_PACKED_LEFTOVER}
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
              <BoothDeckEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
