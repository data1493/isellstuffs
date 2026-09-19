import Link from "next/link";

import { BoothStackEmpty } from "@/app/stalls/[slug]/stack/empty";
import { BoothStackForm } from "@/components/stalls/booth-stack-form";
import { SyncBoothStack } from "@/components/stalls/sync-booth-stack";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_STACK_EMPTY_TAPE,
  BOOTH_STACK_MIRROR_SCRIPT,
  BOOTH_STACK_PACKED_LEFTOVER,
  BOOTH_STACK_PAPER_LINE,
  type BoothStackMap,
  type BoothStackNote,
} from "@/lib/booth-stack";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothStackBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothStackMap;
  current?: BoothStackNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_STACK_MIRROR_SCRIPT }} />
      <SyncBoothStack map={map} />

      <MallHero>
        <MallCrumb label="Don't unfold the pile">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">The pile</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Ask the top
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Leave it folded
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Don&apos;t unfold the pile</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Ask what&apos;s on top.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_STACK_PAPER_LINE} {stall.boothName} keeps this note. Ask is
            the LP flip. Walkers still wreck Hall Closet for a Medium.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The pile note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                Leave the stack folded.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. Don&apos;t unfold the pile. Ask
                what&apos;s on top. Ask is the LP flip. Walkers still wreck Hall
                Closet for a Medium. Clear deletes this booth only.
              </p>
            </div>
            <BoothStackForm
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
              . The lot still says who set up. This note does not rewrite ask,
              stay, or dig.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank pile note"
                title={BOOTH_STACK_EMPTY_TAPE}
                body="Empty tape does not stick. Write the pile note — don't unfold the pile — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="Don't unfold the pile."
                body={
                  <div className="space-y-3">
                    <p data-booth-stack-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-stack-leftover="">
                        {BOOTH_STACK_PACKED_LEFTOVER}
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
              <BoothStackEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
