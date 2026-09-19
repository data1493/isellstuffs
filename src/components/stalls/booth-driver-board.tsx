import Link from "next/link";

import { BoothDriverEmpty } from "@/app/stalls/[slug]/driver/empty";
import { BoothDriverForm } from "@/components/stalls/booth-driver-form";
import { SyncBoothDriver } from "@/components/stalls/sync-booth-driver";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import {
  BOOTH_DRIVER_EMPTY_TAPE,
  BOOTH_DRIVER_MIRROR_SCRIPT,
  BOOTH_DRIVER_PACKED_LEFTOVER,
  BOOTH_DRIVER_PAPER_LINE,
  type BoothDriverMap,
  type BoothDriverNote,
} from "@/lib/booth-driver";
import type { Stall } from "@/lib/commerce";
import { lotPath, stallPath } from "@/lib/paths";

export function BoothDriverBoard({
  stall,
  map,
  current,
  packed,
  emptyTape,
}: {
  stall: Stall;
  map: BoothDriverMap;
  current?: BoothDriverNote;
  packed: boolean;
  emptyTape?: boolean;
}) {
  return (
    <div data-booth-driver-state={current ? "taped" : "open"}>
      <script dangerouslySetInnerHTML={{ __html: BOOTH_DRIVER_MIRROR_SCRIPT }} />
      <SyncBoothDriver map={map} />

      <MallHero>
        <MallCrumb label="I don't have a driver">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Blister closed</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            That booth
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Blister closed
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Still tested kinda
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>I don&apos;t have a driver</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Blister stays closed.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {BOOTH_DRIVER_PAPER_LINE} {stall.boothName} keeps this note. Walkers
            still want a Phillips, or to open the Game Boy.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The driver note</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                I don&apos;t have a driver.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One sentence for this booth. I don&apos;t have a driver. Blister
                stays closed. Still tested kinda. Clear deletes this booth only.
              </p>
            </div>
            <BoothDriverForm
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
              shell, fix, meter, flash, or the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank driver note"
                title={BOOTH_DRIVER_EMPTY_TAPE}
                body="Empty tape does not stick. Write the driver note — I don't have a driver — then tape it."
              />
            ) : null}

            {current ? (
              <MallNotice
                tone="empty"
                padded={false}
                titleAs="h2"
                eyebrow="On this booth"
                title="I don't have a driver."
                body={
                  <div className="space-y-3">
                    <p data-booth-driver-note={stall.id}>{current.note}</p>
                    {packed ? (
                      <p data-booth-driver-leftover="">
                        {BOOTH_DRIVER_PACKED_LEFTOVER}
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
              <BoothDriverEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
