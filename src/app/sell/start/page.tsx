import type { Metadata } from "next";
import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sellNewPath, sellPath, sellStartPath, stallPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";
import { sellStartStalls } from "@/lib/sell-start";

export const dynamic = "force-dynamic";

export const metadata: Metadata = shareMetadata({
  title: "Start selling",
  description:
    "Pick a booth the mall already has, then a kind. The dump form stays as a shortcut.",
  path: sellStartPath(),
});

export default function SellStartPage() {
  const booths = sellStartStalls();

  if (booths.length === 0) {
    return (
      <MallNotice
        tone="empty"
        eyebrow="Empty table"
        title="No booth to pick."
        body="The mall still lists on stalls that already exist. Walk back to sell and try the dump form if the floor is bare."
        actions={
          <>
            <Button
              className="rounded-full px-5"
              render={<Link href={sellPath()} />}
            >
              Back to sell
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href={sellNewPath()} />}
            >
              Use the dump form
            </Button>
          </>
        }
      />
    );
  }

  return (
    <div>
      <MallHero>
        <MallCrumb label="Start selling">
          <CrumbSep />
          <Link href={sellPath()} className="hover:text-foreground hover:underline">
            Sell
          </Link>
          <CrumbSep />
          <span className="text-foreground">Start</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Step 1 of 3
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Existing booths
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Pick a booth that is already here.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            You list on a stall the mall already has. No new shop. No
            artisan-home wing. Kind comes next. The dump form is still a
            shortcut if you already know the table.
          </p>
        </div>
      </MallHero>

      <MallSection>
        <MallEyebrow>Booths on the floor</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          One table. Then a kind.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Folding Table Tuesday is the usual first stop. Any of these already
          sell both objects and files.
        </p>
        <ul className="mt-8 grid gap-3">
          {booths.map((stall) => (
            <li key={stall.id}>
              <Link
                href={sellStartPath(stall.slug)}
                className="block w-full rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:ring-foreground/20"
              >
                <p className="font-heading text-xl tracking-tight">
                  {stall.boothName}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {stall.blurb}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm leading-6 text-muted-foreground">
          Want the whole form at once?{" "}
          <Link
            href={sellNewPath()}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Use the dump shortcut
          </Link>
          . Or{" "}
          <Link
            href={stallPath("folding-table-tuesday")}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            walk Folding Table Tuesday
          </Link>{" "}
          first.
        </p>
      </MallSection>
    </div>
  );
}
