import Link from "next/link";

import { BoothShellEmpty } from "@/app/stalls/[slug]/shell/empty";
import { BoothShellForm } from "@/components/stalls/booth-shell-form";
import { SyncBoothShell } from "@/components/stalls/sync-booth-shell";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_SHELL_EMPTY_TAPE,
  BOOTH_SHELL_MIRROR_SCRIPT,
  BOOTH_SHELL_PACKED_LEFTOVER,
  BOOTH_SHELL_PAPER_LINE,
  type BoothShellMap,
  type BoothShellNote,
} from "@/lib/booth-shell";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothShellBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothShellMap;
  current?: BoothShellNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_SHELL_MIRROR_SCRIPT }} />
      <SyncBoothShell map={map} />

      <MallHero>
        <MallCrumb label="Don't open the shell">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">The blister</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Factory seal
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still tote
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Don&apos;t open the shell</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Don&apos;t crack the blister.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_SHELL_PAPER_LINE} {stall.boothName} keeps this note. The boxed
            unit stays on the table. The tote still bags it.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The shell note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                What stays factory sealed?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. Don&apos;t open the shell.
                Don&apos;t crack the blister. Still tote. Clear deletes this
                booth only.
              </p>
            </div>
            <BoothShellForm
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
              . The lot still says who set up. This note does not rewrite wrap
              paper, a poly bag, or jewel cases.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank shell note"
                title={BOOTH_SHELL_EMPTY_TAPE}
                body="Empty tape does not stick. Write the shell note — don't open the shell — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="Don't open the shell."
                body={
                  <div className="space-y-3">
                    <p data-booth-shell-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-shell-leftover="">
                        {BOOTH_SHELL_PACKED_LEFTOVER}
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
              <BoothShellEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
