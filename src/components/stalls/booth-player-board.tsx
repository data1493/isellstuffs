import Link from "next/link";

import { BoothPlayerEmpty } from "@/app/stalls/[slug]/player/empty";
import { BoothPlayerForm } from "@/components/stalls/booth-player-form";
import { SyncBoothPlayer } from "@/components/stalls/sync-booth-player";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_PLAYER_EMPTY_TAPE,
  BOOTH_PLAYER_MIRROR_SCRIPT,
  BOOTH_PLAYER_PACKED_LEFTOVER,
  BOOTH_PLAYER_PAPER_LINE,
  type BoothPlayerMap,
  type BoothPlayerNote,
} from "@/lib/booth-player";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothPlayerBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothPlayerMap;
  current?: BoothPlayerNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div data-booth-player-state={current ? "taped" : "open"}>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_PLAYER_MIRROR_SCRIPT }} />
      <SyncBoothPlayer map={map} />

      <MallHero>
        <MallCrumb label="I don't have a player">
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
            Still Sharpie
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still a table
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have a player</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Still Sharpie. Still a table.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_PLAYER_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            still want a Discman, or to play BEATS 07 at the table.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The player note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have a player.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have a player. Still
                Sharpie. Still a table. Clear deletes this booth only.
              </p>
            </div>
            <BoothPlayerForm
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
              copy, burn, stick, wifi, deck, or the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank player note"
                title={BOOTH_PLAYER_EMPTY_TAPE}
                body="Empty tape does not stick. Write the player note — I don't have a player — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have a player."
                body={
                  <div className="space-y-3">
                    <p data-booth-player-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-player-leftover="">
                        {BOOTH_PLAYER_PACKED_LEFTOVER}
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
              <BoothPlayerEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
