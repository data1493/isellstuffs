import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { FreeBoxEmpty } from "@/components/stalls/free-box-empty";
import { FreeBoxForm } from "@/components/stalls/free-box-form";
import { FreeBoxTitle } from "@/components/stalls/free-box-title";
import { SyncFreeBox } from "@/components/stalls/sync-free-box";
import { Badge } from "@/components/ui/badge";
import type { Stall } from "@/lib/commerce";
import {
  FREE_PAPER_LINE,
  FREE_RELOAD_LINE,
  type FreeTitle,
} from "@/lib/free-box";
import { stallPath } from "@/lib/paths";

export function FreeBoxBoard({
  stall,
  titles,
  emptyTape,
}: {
  stall: Stall;
  titles: FreeTitle[];
  emptyTape?: boolean;
}) {
  return (
    <div data-free-box="board" data-free-box-stall={stall.slug}>
      <SyncFreeBox titles={titles} />

      <MallHero>
        <MallCrumb label="Free box">
          <CrumbSep />
          <Link
            href={stallPath(stall.slug)}
            className="hover:text-foreground hover:underline"
          >
            {stall.boothName}
          </Link>
          <CrumbSep />
          <span className="text-foreground">Free</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Cardboard pile
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Not a $0 listing
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <MallEyebrow>Free box</MallEyebrow>
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Tape a title on the pile.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {FREE_PAPER_LINE} {FREE_RELOAD_LINE} {stall.boothName} keeps this
            pile. Other booths keep theirs.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <div>
              <MallEyebrow>The pile</MallEyebrow>
              <h2 className="mt-2 font-heading text-3xl tracking-tight">
                What is free on this booth?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                One title. Extra plastic hangers. A cracked hanger box. After
                you tape it, the pile is still here when you reload. Twenty
                titles on this booth is the lid.
              </p>
            </div>
            <FreeBoxForm slug={stall.slug} />
            <p className="text-sm leading-6 text-muted-foreground">
              The stall is still{" "}
              <Link
                href={stallPath(stall.slug)}
                className="underline underline-offset-4"
              >
                {stall.boothName}
              </Link>
              . This pile does not list a SKU, change a tag, or bag the tote.
            </p>
          </div>

          <div className="space-y-4">
            {emptyTape ? (
              <MallNotice
                tone="error"
                padded={false}
                titleAs="h2"
                eyebrow="Blank title"
                title="Tape a title or leave the pile."
                body="Empty tape does not stick. Write the title — extra plastic hangers — then tape it."
              />
            ) : null}

            {titles.length > 0 ? (
              titles.map((item) => (
                <FreeBoxTitle key={item.id} item={item} slug={stall.slug} />
              ))
            ) : emptyTape ? null : (
              <FreeBoxEmpty slug={stall.slug} boothName={stall.boothName} />
            )}
          </div>
        </div>
      </MallSection>
    </div>
  );
}
