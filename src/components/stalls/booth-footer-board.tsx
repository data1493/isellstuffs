import Link from "next/link";

import { BoothFooterEmpty } from "@/app/stalls/[slug]/footer/empty";
import { BoothFooterForm } from "@/components/stalls/booth-footer-form";
import { SyncBoothFooter } from "@/components/stalls/sync-booth-footer";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_FOOTER_EMPTY_TAPE,
  BOOTH_FOOTER_MIRROR_SCRIPT,
  BOOTH_FOOTER_PACKED_LEFTOVER,
  BOOTH_FOOTER_PAPER_LINE,
  type BoothFooterMap,
  type BoothFooterNote,
} from "@/lib/booth-footer";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothFooterBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothFooterMap;
  current?: BoothFooterNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div data-booth-footer-state={current ? "taped" : "open"}>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_FOOTER_MIRROR_SCRIPT }} />
      <SyncBoothFooter map={map} />

      <MallHero>
        <MallCrumb label="I don't have a footer">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Still a crate</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still a crate
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still a skip
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still Sunday Crate
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have a footer</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Still a crate. Still a skip.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_FOOTER_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            still want a footer, or so the unnamed LP sits shop-level without
            a shop bearing.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The footer note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have a footer.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have a footer. Still a
                crate. Still a skip. Clear deletes this booth only.
              </p>
            </div>
            <BoothFooterForm
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
              bearing, bone, plinth, or the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank footer note"
                title={BOOTH_FOOTER_EMPTY_TAPE}
                body="Empty tape does not stick. Write the footer note — I don't have a footer — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have a footer."
                body={
                  <div className="space-y-3">
                    <p data-booth-footer-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-footer-leftover="">
                        {BOOTH_FOOTER_PACKED_LEFTOVER}
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
              <BoothFooterEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
