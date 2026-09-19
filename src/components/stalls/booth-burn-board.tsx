import Link from "next/link";

import { BoothBurnEmpty } from "@/app/stalls/[slug]/burn/empty";
import { BoothBurnForm } from "@/components/stalls/booth-burn-form";
import { SyncBoothBurn } from "@/components/stalls/sync-booth-burn";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_BURN_EMPTY_TAPE,
  BOOTH_BURN_MIRROR_SCRIPT,
  BOOTH_BURN_PACKED_LEFTOVER,
  BOOTH_BURN_PAPER_LINE,
  type BoothBurnMap,
  type BoothBurnNote,
} from "@/lib/booth-burn";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothBurnBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothBurnMap;
  current?: BoothBurnNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_BURN_MIRROR_SCRIPT }} />
      <SyncBoothBurn map={map} />

      <MallHero>
        <MallCrumb label="I don't burn a disc">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">The leftover disc</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Folder delivers
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a CD-R
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t burn a disc</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Pay and open the folder.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_BURN_PAPER_LINE} {stall.boothName} keeps this note. Stick is
            no email. Plays is this Sharpie copy. Walkers still ask Beats to
            burn a fresh disc.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The burn note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t burn a CD-R.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t burn a disc. Pay and
                open the folder. The leftover disc is the leftover disc. Not
                plays. Not stick. Not a print shop. Clear deletes this booth
                only.
              </p>
            </div>
            <BoothBurnForm
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
              . The lot still says who set up. This note does not rewrite stick,
              plays, or the folder.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank burn note"
                title={BOOTH_BURN_EMPTY_TAPE}
                body="Empty tape does not stick. Write the burn note — I don't burn a disc — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't burn a disc."
                body={
                  <div className="space-y-3">
                    <p data-booth-burn-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-burn-leftover="">
                        {BOOTH_BURN_PACKED_LEFTOVER}
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
              <BoothBurnEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
