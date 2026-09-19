import Link from "next/link";

import { BoothStickEmpty } from "@/app/stalls/[slug]/stick/empty";
import { BoothStickForm } from "@/components/stalls/booth-stick-form";
import { SyncBoothStick } from "@/components/stalls/sync-booth-stick";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_STICK_EMPTY_TAPE,
  BOOTH_STICK_MIRROR_SCRIPT,
  BOOTH_STICK_PACKED_LEFTOVER,
  BOOTH_STICK_PAPER_LINE,
  type BoothStickMap,
  type BoothStickNote,
} from "@/lib/booth-stick";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothStickBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothStickMap;
  current?: BoothStickNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_STICK_MIRROR_SCRIPT }} />
      <SyncBoothStick map={map} />

      <MallHero>
        <MallCrumb label="I don't email the zip">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">The stick</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Folder delivers
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not SMTP
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t email the zip</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Pay and open the folder.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_STICK_PAPER_LINE} {stall.boothName} keeps this note. Plays is
            the disc. The folder already delivers. Walkers still ask to mail the
            zip.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The stick note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                How do they get the zip?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t email the zip. Pay and
                open the folder, or bring a stick. Not SMTP. Clear deletes this
                booth only.
              </p>
            </div>
            <BoothStickForm
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
              . The lot still says who set up. This note does not rewrite plays,
              a scan mate, or the folder.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank stick note"
                title={BOOTH_STICK_EMPTY_TAPE}
                body="Empty tape does not stick. Write the zip note — I don't email the zip — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't email the zip."
                body={
                  <div className="space-y-3">
                    <p data-booth-stick-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-stick-leftover="">
                        {BOOTH_STICK_PACKED_LEFTOVER}
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
              <BoothStickEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
