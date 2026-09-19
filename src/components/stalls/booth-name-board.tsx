import Link from "next/link";

import { BoothNameEmpty } from "@/app/stalls/[slug]/name/empty";
import { BoothNameForm } from "@/components/stalls/booth-name-form";
import { SyncBoothName } from "@/components/stalls/sync-booth-name";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_NAME_EMPTY_TAPE,
  BOOTH_NAME_MIRROR_SCRIPT,
  BOOTH_NAME_PACKED_LEFTOVER,
  BOOTH_NAME_PAPER_LINE,
  type BoothNameMap,
  type BoothNameNote,
} from "@/lib/booth-name";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothNameBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothNameMap;
  current?: BoothNameNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_NAME_MIRROR_SCRIPT }} />
      <SyncBoothName map={map} />

      <MallHero>
        <MallCrumb label="I will not name them">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">The unnamed crate</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Side A still plays
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a liner shop
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I will not name them</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Side A still plays.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_NAME_PAPER_LINE} {stall.boothName} keeps this note. Songs is
            cassette titles. Sleeve is the grocery bag. Dust stays. Walkers
            still ask Sunday Crate what the unnamed LP is.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The name note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I will not name the LP.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I will not name them. Side A still
                plays. Not songs. Not a liner shop. Not sleeve. Clear deletes
                this booth only.
              </p>
            </div>
            <BoothNameForm
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
              songs, sleeve, dust, press, or the deck.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank name note"
                title={BOOTH_NAME_EMPTY_TAPE}
                body="Empty tape does not stick. Write the name note — I will not name them — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I will not name them."
                body={
                  <div className="space-y-3">
                    <p data-booth-name-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-name-leftover="">
                        {BOOTH_NAME_PACKED_LEFTOVER}
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
              <BoothNameEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
