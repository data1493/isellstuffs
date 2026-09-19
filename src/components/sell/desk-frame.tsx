import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";

import { DeskBoard } from "@/components/sell/desk-board";
import { DeskOfferScraps } from "@/components/sell/desk-offer-scraps";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Listing, Stall } from "@/lib/commerce";
import {
  feesPath,
  sellNewPath,
  sellPath,
  sellPayoutsPath,
  sellStartPath,
  stallEditPath,
  stallPath,
} from "@/lib/paths";
import {
  parseWeekendPinIds,
  WEEKEND_PINS_COOKIE_NAME,
} from "@/lib/weekend-table-pin";

function shortcutsFor(stall: Stall) {
  return [
    {
      href: sellNewPath(),
      title: "List something",
      body: "Put a thing or a file on this booth. Same form as /sell/new.",
    },
    {
      href: sellPayoutsPath(),
      title: "Paper payouts",
      body: "What the stall would get after the 10% mall cut. No bank.",
    },
    {
      href: feesPath(),
      title: "The cut",
      body: "10% from the stall, not on top of the buyer. The seller contract.",
    },
    {
      href: stallEditPath(stall.slug),
      title: "Rewrite the booth",
      body: `Change the name and pitch. The slug stays ${stall.boothName}.`,
    },
  ];
}

export async function DeskFrame({
  stall,
  listings,
  children,
}: {
  stall: Stall;
  listings: Listing[];
  children?: ReactNode;
}) {
  const shortcuts = shortcutsFor(stall);
  const jar = await cookies();
  const weekendPins = parseWeekendPinIds(
    jar.get(WEEKEND_PINS_COOKIE_NAME)?.value,
  );

  return (
    <div>
      <MallHero>
        <MallCrumb label="Stall desk">
          <CrumbSep />
          <Link href={sellPath()} className="hover:text-foreground hover:underline">
            Sell
          </Link>
          <CrumbSep />
          <span className="text-foreground">Desk</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            One stall
          </Badge>
          <Badge variant="outline" className="rounded-full">
            No account
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Your table tonight.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            This desk is {stall.boothName}. List something, check paper
            payouts, read the cut, or rewrite the booth card. It is the home
            after you already know the deal — not a second sell page.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            size="lg"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href={sellNewPath()} />}
          >
            List something
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href={sellStartPath()} />}
          >
            Walk it
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href={sellPayoutsPath()} />}
          >
            See paper payouts
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href={feesPath()} />}
          >
            Read the cut
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href={stallEditPath(stall.slug)} />}
          >
            Rewrite the booth card
          </Button>
        </div>
      </MallHero>

      <MallSection>
        <MallEyebrow>From this desk</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          List, payouts, fees, booth card.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Four doors. Same stall.{" "}
          <Link
            href={stallPath(stall.slug)}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            See the booth on the floor
          </Link>
          .
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {shortcuts.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block h-full rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:ring-foreground/20"
              >
                <p className="font-heading text-xl tracking-tight">
                  {item.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        {children}
      </MallSection>

      <MallSection className="border-y border-border bg-card/60">
        <MallEyebrow>On this table</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          Stand-in stock, plus anything you listed.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Fixture SKUs from the catalog this booth already has, then any
          overlay row you put on {stall.boothName}. Sold stays on the table so
          you can see what walked.
        </p>
        <div className="mt-8">
          <DeskOfferScraps
            stallId={stall.id}
            stallSlug={stall.slug}
            listings={listings}
          />
          <DeskBoard
            stall={stall}
            listings={listings}
            weekendPins={weekendPins}
          />
        </div>
      </MallSection>
    </div>
  );
}
