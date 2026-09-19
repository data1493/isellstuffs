import Link from "next/link";

import { BoothFixEmpty } from "@/app/stalls/[slug]/fix/empty";
import { BoothFixForm } from "@/components/stalls/booth-fix-form";
import { SyncBoothFix } from "@/components/stalls/sync-booth-fix";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_FIX_EMPTY_TAPE,
  BOOTH_FIX_MIRROR_SCRIPT,
  BOOTH_FIX_PACKED_LEFTOVER,
  BOOTH_FIX_PAPER_LINE,
  type BoothFixMap,
  type BoothFixNote,
} from "@/lib/booth-fix";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothFixBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothFixMap;
  current?: BoothFixNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_FIX_MIRROR_SCRIPT }} />
      <SyncBoothFix map={map} />

      <MallHero>
        <MallCrumb label="I don't fix">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">The iron</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            No repair
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still tote
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t fix</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            I sell it, I don&apos;t repair it.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_FIX_PAPER_LINE} {stall.boothName} keeps this note. The Game
            Boy stays on the table as-sold. The tote still bags it.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The no-repair note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                What don&apos;t you fix?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I sell it, I don&apos;t repair it.
                Walkers still ask Half-Working to fix the Game Boy. Still tote.
                Clear deletes this booth only.
              </p>
            </div>
            <BoothFixForm
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
              . The lot still says who set up. This note does not rewrite parts,
              a missing remote, or a factory-seal blister.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank no-repair note"
                title={BOOTH_FIX_EMPTY_TAPE}
                body="Empty tape does not stick. Write the no-repair note — I don't fix — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't fix."
                body={
                  <div className="space-y-3">
                    <p data-booth-fix-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-fix-leftover="">
                        {BOOTH_FIX_PACKED_LEFTOVER}
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
              <BoothFixEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
