import Link from "next/link";

import { BoothThimbleEmpty } from "@/app/stalls/[slug]/thimble/empty";
import { BoothThimbleForm } from "@/components/stalls/booth-thimble-form";
import { SyncBoothThimble } from "@/components/stalls/sync-booth-thimble";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_THIMBLE_EMPTY_TAPE,
  BOOTH_THIMBLE_MIRROR_SCRIPT,
  BOOTH_THIMBLE_PACKED_LEFTOVER,
  BOOTH_THIMBLE_PAPER_LINE,
  type BoothThimbleMap,
  type BoothThimbleNote,
} from "@/lib/booth-thimble";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothThimbleBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothThimbleMap;
  current?: BoothThimbleNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div data-booth-thimble-state={current ? "taped" : "open"}>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_THIMBLE_MIRROR_SCRIPT }} />
      <SyncBoothThimble map={map} />

      <MallHero>
        <MallCrumb label="I don't have a thimble">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Still a closet. Still worn twice</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still a closet
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still worn twice
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have a thimble</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Still a closet. Still worn twice.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_THIMBLE_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            still want a thimble, or something to push the needle.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The thimble note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have a thimble.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have a thimble. Still
                a closet. Still worn twice. Clear deletes this booth only.
              </p>
            </div>
            <BoothThimbleForm
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
              sew, stay, or the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank thimble note"
                title={BOOTH_THIMBLE_EMPTY_TAPE}
                body="Empty tape does not stick. Write the thimble note — I don't have a thimble — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have a thimble."
                body={
                  <div className="space-y-3">
                    <p data-booth-thimble-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-thimble-leftover="">
                        {BOOTH_THIMBLE_PACKED_LEFTOVER}
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
              <BoothThimbleEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
