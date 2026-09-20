import Link from "next/link";

import { BoothMalletEmpty } from "@/app/stalls/[slug]/mallet/empty";
import { BoothMalletForm } from "@/components/stalls/booth-mallet-form";
import { SyncBoothMallet } from "@/components/stalls/sync-booth-mallet";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_MALLET_EMPTY_TAPE,
  BOOTH_MALLET_MIRROR_SCRIPT,
  BOOTH_MALLET_PACKED_LEFTOVER,
  BOOTH_MALLET_PAPER_LINE,
  type BoothMalletMap,
  type BoothMalletNote,
} from "@/lib/booth-mallet";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothMalletBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothMalletMap;
  current?: BoothMalletNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div data-booth-mallet-state={current ? "taped" : "open"}>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_MALLET_MIRROR_SCRIPT }} />
      <SyncBoothMallet map={map} />

      <MallHero>
        <MallCrumb label="I don't have a mallet">
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
            Still a stain
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still Tuesday
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have a mallet</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Still a driveway. Still a stain.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_MALLET_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            still want a mallet, or so they can peen the lamp without a vise.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The mallet note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have a mallet.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have a mallet. Still a
                driveway. Still a stain. Clear deletes this booth only.
              </p>
            </div>
            <BoothMalletForm
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
              . The lot still says who set up. This note does not rewrite peen,
              clamp, jig, or the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank mallet note"
                title={BOOTH_MALLET_EMPTY_TAPE}
                body="Empty tape does not stick. Write the mallet note — I don't have a mallet — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have a mallet."
                body={
                  <div className="space-y-3">
                    <p data-booth-mallet-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-mallet-leftover="">
                        {BOOTH_MALLET_PACKED_LEFTOVER}
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
              <BoothMalletEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
