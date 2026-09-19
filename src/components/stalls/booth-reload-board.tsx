import Link from "next/link";

import { BoothReloadEmpty } from "@/app/stalls/[slug]/reload/empty";
import { BoothReloadForm } from "@/components/stalls/booth-reload-form";
import { SyncBoothReload } from "@/components/stalls/sync-booth-reload";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_RELOAD_EMPTY_TAPE,
  BOOTH_RELOAD_MIRROR_SCRIPT,
  BOOTH_RELOAD_PACKED_LEFTOVER,
  BOOTH_RELOAD_PAPER_LINE,
  type BoothReloadMap,
  type BoothReloadNote,
} from "@/lib/booth-reload";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothReloadBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothReloadMap;
  current?: BoothReloadNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_RELOAD_MIRROR_SCRIPT }} />
      <SyncBoothReload map={map} />

      <MallHero>
        <MallCrumb label="I don't reload">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Face value</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Face value
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a wallet
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t reload</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Face value.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_RELOAD_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            still want five more on the leftover. I don&apos;t reload.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The reload note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t reload.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t reload. Face value.
                Not a wallet. Clear deletes this booth only.
              </p>
            </div>
            <BoothReloadForm
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
              . The lot still says who set up. This note does not rewrite the
              tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank reload note"
                title={BOOTH_RELOAD_EMPTY_TAPE}
                body="Empty tape does not stick. Write the reload note — I don't reload — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't reload."
                body={
                  <div className="space-y-3">
                    <p data-booth-reload-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-reload-leftover="">
                        {BOOTH_RELOAD_PACKED_LEFTOVER}
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
              <BoothReloadEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
