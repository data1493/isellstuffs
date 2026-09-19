import Link from "next/link";

import { BoothFilmEmpty } from "@/app/stalls/[slug]/film/empty";
import { BoothFilmForm } from "@/components/stalls/booth-film-form";
import { SyncBoothFilm } from "@/components/stalls/sync-booth-film";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_FILM_EMPTY_TAPE,
  BOOTH_FILM_MIRROR_SCRIPT,
  BOOTH_FILM_PACKED_LEFTOVER,
  BOOTH_FILM_PAPER_LINE,
  type BoothFilmMap,
  type BoothFilmNote,
} from "@/lib/booth-film";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothFilmBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothFilmMap;
  current?: BoothFilmNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_FILM_MIRROR_SCRIPT }} />
      <SyncBoothFilm map={map} />

      <MallHero>
        <MallCrumb label="Don't photograph the tags">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">The tags</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            3×5 tags
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not look
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Don&apos;t photograph the tags</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Walkers still film every 3×5.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_FILM_PAPER_LINE} {stall.boothName} keeps this note. Look is
            still a display piece.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The no-photos note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                What stays off camera?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. Don&apos;t photograph the tags.
                Walkers still film every 3×5. Clear deletes this booth only.
              </p>
            </div>
            <BoothFilmForm
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
              . The lot still says who set up. This note does not rewrite look,
              ask, or a flyer.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank no-photos note"
                title={BOOTH_FILM_EMPTY_TAPE}
                body="Empty tape does not stick. Write the no-photos note — don't photograph — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="Don't photograph the tags."
                body={
                  <div className="space-y-3">
                    <p data-booth-film-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-film-leftover="">
                        {BOOTH_FILM_PACKED_LEFTOVER}
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
              <BoothFilmEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
