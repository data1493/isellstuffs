import type { Metadata } from "next";
import Link from "next/link";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLATFORM_FEE_BPS } from "@/lib/checkout";
import { formatMoney, mallHubs, money, stalls } from "@/lib/commerce";
import { advertisePath, feesPath, sellDeskPath, sellNewPath, sellPath, sellPayoutsPath, sellStartPath, stallPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const feePercent = PLATFORM_FEE_BPS / 100;

export const metadata: Metadata = shareMetadata({
  title: "Sell",
  description:
    "Put junk on a table. Physical and digital from the same stall. The mall keeps 10% from the stall, not on top of the buyer.",
  path: sellPath(),
});

const reasons = [
  {
    title: "A stall, not a storefront",
    body: "You keep a booth. The mall is the building. Shoppers walk aisles and buy from tables, not from one vendor with a catalog.",
  },
  {
    title: "Both kinds on one table",
    body: "A cracked Game Boy and a parking-lot LUT pack can share a stall. Digital is a listing type, not a second website.",
  },
  {
    title: "Paid corners stay labeled",
    body: "If you buy light later, we stamp it. No stealth sponsored rows. Ads are a product on the rate card, not a whisper in the grid.",
  },
];

export default function SellPage() {
  const sample = money(1000);
  const mallCut = money(Math.round((sample.amountCents * PLATFORM_FEE_BPS) / 10_000));
  const stallKeeps = money(sample.amountCents - mallCut.amountCents);

  return (
    <div>
      <MallHero>
        <MallCrumb label="Sell">
          <CrumbSep />
          <span className="text-foreground">Sell</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            No account
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Same stall, two kinds
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            Put junk on a table.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            This is a flea-market mall. You list from a stall that already
            exists. Physical finds and digital files sit on the same booth.
            There is no Stripe Connect onboarding and no warehouse behind the
            wall.
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
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href={sellStartPath()} />}
          >
            Start at the first table
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href="/explore" />}
          >
            Walk the floor first
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
            render={<Link href={sellDeskPath()} />}
          >
            Open the stall desk
          </Button>
        </div>
      </MallHero>

      <MallSection>
        <MallEyebrow>Why sell here</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          The mall is the building. You are the stall.
        </h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {reasons.map((reason, index) => (
            <li key={reason.title}>
              <p className="font-heading text-4xl text-primary">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-heading text-2xl tracking-tight">
                {reason.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {reason.body}
              </p>
            </li>
          ))}
        </ul>
      </MallSection>

      <MallSection className="border-y border-border bg-card/60">
        <MallEyebrow>Fees</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          The mall keeps {feePercent}%. From the stall, not on top.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          A {formatMoney(sample)} tag means the buyer pays {formatMoney(sample)}.
          The mall retains {formatMoney(mallCut)}. The stall is owed{" "}
          {formatMoney(stallKeeps)}. That cut is not stacked onto the price at
          checkout.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Mall cut</CardTitle>
              <CardDescription className="text-base leading-6">
                {feePercent}% of the listing. Separate charges and transfers
                keep it. No application fee tacked on the buyer.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">No warehouse</CardTitle>
              <CardDescription className="text-base leading-6">
                Physical stays with the booth. The mall does not ship your
                lamp. Digital is a file from the same stall, not a CDN product.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Ads are extra</CardTitle>
              <CardDescription className="text-base leading-6">
                Light on the concourse is a labeled product. Listing is free on
                this stand-in table.{" "}
                <Link
                  href={advertisePath()}
                  className="underline-offset-4 hover:underline"
                >
                  Read the rate card
                </Link>
                .
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-6 text-muted-foreground">
          Payouts are a stand-in. There is no live Connect onboarding. You are
          putting something on a table, not opening a merchant account.{" "}
          <Link
            href={sellPayoutsPath()}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            See what the stall would get
          </Link>
          {" · "}
          <Link
            href={feesPath()}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Read the cut
          </Link>
          .
        </p>
      </MallSection>

      <MallSection>
        <MallEyebrow>Physical vs digital</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          Same booth. Two listing types.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Pick a stall that already has a corner. Add a thing you can hold, a
          file, or both. Download Stall is an aisle, not a separate shop.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="bg-card">
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                Physical
              </Badge>
              <CardTitle className="font-heading text-2xl">
                Things you can hold
              </CardTitle>
              <CardDescription className="text-base leading-6">
                Yard Sale, Closet Overflow, Garage Tech. Condition is a
                first-class field. “Tested, kinda” is valid copy. No artisan
                home, no lookbook.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card">
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                Digital
              </Badge>
              <CardTitle className="font-heading text-2xl">
                Files from the same stall
              </CardTitle>
              <CardDescription className="text-base leading-6">
                PDFs, beats, LUTs, fonts. File format stands in for condition.
                The listing still belongs to the booth that sold the junk.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {mallHubs.map((hub) => (
            <li key={hub.id}>
              <Link
                href={hub.href}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {hub.name}
              </Link>
            </li>
          ))}
        </ul>
      </MallSection>

      <MallSection className="border-t border-border">
        <MallEyebrow>Existing booths</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          Add to a stall that is already on the floor.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          This stand-in does not open a new legal entity. You list on a booth
          the shop already knows. Each of these already sells both kinds.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {stalls.map((stall) => (
            <li key={stall.id}>
              <Link
                href={stallPath(stall.slug)}
                className="block rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:ring-foreground/20"
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
        <div className="mt-8">
          <Button
            size="lg"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href={sellNewPath()} />}
          >
            Start a listing
          </Button>
        </div>
      </MallSection>
    </div>
  );
}
