import Link from "next/link";

import { BoothFlashEmpty } from "@/app/stalls/[slug]/flash/empty";
import { BoothFlashForm } from "@/components/stalls/booth-flash-form";
import { SyncBoothFlash } from "@/components/stalls/sync-booth-flash";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_FLASH_EMPTY_TAPE,
  BOOTH_FLASH_MIRROR_SCRIPT,
  BOOTH_FLASH_PACKED_LEFTOVER,
  BOOTH_FLASH_PAPER_LINE,
  type BoothFlashMap,
  type BoothFlashNote,
} from "@/lib/booth-flash";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothFlashBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothFlashMap;
  current?: BoothFlashNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_FLASH_MIRROR_SCRIPT }} />
      <SyncBoothFlash map={map} />

      <MallHero>
        <MallCrumb label="I don't flash">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">What boots</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            What boots
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a flash desk
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t flash</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            What boots is what boots.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_FLASH_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            still want a cleaner Tetris, or to update the cart.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The flash note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t flash.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t flash. What boots is
                what boots. Not a flash desk. Clear deletes this booth only.
              </p>
            </div>
            <BoothFlashForm
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
              Game Boy, the LUT, or the buy grid.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank flash note"
                title={BOOTH_FLASH_EMPTY_TAPE}
                body="Empty tape does not stick. Write the flash note — I don't flash — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't flash."
                body={
                  <div className="space-y-3">
                    <p data-booth-flash-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-flash-leftover="">
                        {BOOTH_FLASH_PACKED_LEFTOVER}
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
              <BoothFlashEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
