import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallNotice } from "@/components/mall-notice";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { PayoutWalkedTape } from "@/components/sell/payout-walked";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CHECKOUT_COOKIE, PLATFORM_FEE_BPS } from "@/lib/checkout";
import { formatMoney, isDigitalListing } from "@/lib/commerce";
import { orderSlipFromCheckoutCookie } from "@/lib/order-history";
import {
  feesPath,
  listingPath,
  sellNewPath,
  sellPath,
  sellPayoutsPath,
  sellPayoutsWalkedPath,
  stallPath,
} from "@/lib/paths";
import {
  contractExample,
  feePercent,
  listingPayoutExamples,
  mallPayoutTotals,
  stallPayoutRows,
} from "@/lib/seller-payouts";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = shareMetadata({
  title: "Paper payouts",
  description: `What the stall would get paid after the mall keeps ${feePercent}%. Stand-in numbers. No Stripe Connect, no bank.`,
  path: sellPayoutsPath(),
});

export default async function SellPayoutsPage() {
  const jar = await cookies();
  const seed = orderSlipFromCheckoutCookie(jar.get(CHECKOUT_COOKIE)?.value);
  const contract = contractExample();
  const examples = listingPayoutExamples();
  const rows = stallPayoutRows();
  const totals = mallPayoutTotals(rows);
  const emptyFloor = totals.listingCount === 0;

  return (
    <div>
      <MallHero>
        <MallCrumb label="Paper payouts">
          <CrumbSep />
          <Link href={sellPath()} className="hover:text-foreground hover:underline">
            Sell
          </Link>
          <CrumbSep />
          <span className="text-foreground">Payouts</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Paper only
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Same {feePercent}% the tote uses
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            What the stall would get paid.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            The mall keeps {feePercent}% from the stall, not on top of the
            buyer. These are stand-in numbers from the tables already on the
            floor. Nothing hits a bank. There is no Stripe Connect onboarding.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            size="lg"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href="#the-cut" />}
          >
            See the cut
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href={sellPayoutsWalkedPath()} />}
          >
            What walked
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href={feesPath()} />}
          >
            Read the contract
          </Button>
        </div>
      </MallHero>

      <MallSection id="the-cut" className="border-b border-border">
        <MallEyebrow>The cut</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          {feePercent}% from the stall. That is the whole cut.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Checkout already keeps {feePercent}% of each stall’s subtotal —{" "}
          {PLATFORM_FEE_BPS} of 10,000 basis points. A{" "}
          {formatMoney(contract.tag)} tag means the buyer pays{" "}
          {formatMoney(contract.tag)}. The mall retains{" "}
          {formatMoney(contract.mallCut)}. The stall is owed{" "}
          {formatMoney(contract.stallOwed)}.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card className="bg-card">
            <CardHeader>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                On the tag
              </p>
              <CardTitle className="font-heading text-3xl">
                {formatMoney(contract.tag)}
              </CardTitle>
              <CardDescription className="text-base leading-6">
                Buyer pays the listed price. The cut is not added on top.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card">
            <CardHeader>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Mall keeps
              </p>
              <CardTitle className="font-heading text-3xl">
                {formatMoney(contract.mallCut)}
              </CardTitle>
              <CardDescription className="text-base leading-6">
                {feePercent}% of {formatMoney(contract.tag)}. Taken from the
                stall.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card">
            <CardHeader>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Stall is owed
              </p>
              <CardTitle className="font-heading text-3xl">
                {formatMoney(contract.stallOwed)}
              </CardTitle>
              <CardDescription className="text-base leading-6">
                The rest after the mall cut. Still a paper transfer.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MallSection>

      <MallSection id="walked" className="border-b border-border">
        <MallEyebrow>What walked</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          The {feePercent}% on what actually paid.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Paper only. Checkout is still test pay. Nothing hits a bank. The
          register is the paid tote — not a sold sticker and not the still-here
          brochure below.
        </p>
        <PayoutWalkedTape seed={seed} />
      </MallSection>

      {examples.length > 0 ? (
        <MallSection>
          <MallEyebrow>If this one sold</MallEyebrow>
          <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
            Same cut on a lamp, a Game Boy, and a PDF.
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
            Physical and digital use the same math. A file does not get a
            friendlier rate. Sold and file-gone stay off this paper — they are
            not owed again.
          </p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {examples.map((example) => (
              <li key={example.listing.id}>
                <Card className="h-full bg-card">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit">
                      {isDigitalListing(example.listing) ? "Digital" : "Physical"}
                    </Badge>
                    <CardTitle className="font-heading text-2xl">
                      <Link
                        href={listingPath(example.listing.id)}
                        className="underline-offset-4 hover:underline"
                      >
                        {example.listing.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-base leading-6">
                      {example.stall.boothName}. Tag{" "}
                      {formatMoney(example.tag)}.
                    </CardDescription>
                  </CardHeader>
                  <dl className="grid gap-2 px-4 pb-4 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Mall keeps</dt>
                      <dd className="font-heading">
                        {formatMoney(example.mallCut)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Stall is owed</dt>
                      <dd className="font-heading text-base">
                        {formatMoney(example.stallOwed)}
                      </dd>
                    </div>
                  </dl>
                </Card>
              </li>
            ))}
          </ul>
        </MallSection>
      ) : null}

      <MallSection className="border-y border-border bg-card/60">
        <MallEyebrow>If the tables sold tonight</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          What each booth would take home.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Stand-in totals: every listing still for sale, split the same way
          checkout already splits a tote. Destinations are mock account ids.
          No live transfer.
        </p>

        {emptyFloor ? (
          <div className="mt-8">
            <MallNotice
              tone="empty"
              padded={false}
              titleAs="h2"
              eyebrow="Empty paper"
              title="Nothing for sale on the tables tonight."
              body="Sold and file-gone stay off this board. List something and the cut shows up here as a stand-in."
              actions={
                <Button
                  className="rounded-full px-5"
                  render={<Link href={sellNewPath()} />}
                >
                  List something
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Card className="bg-card">
                <CardHeader>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    On the tags
                  </p>
                  <CardTitle className="font-heading text-3xl">
                    {formatMoney(totals.tag)}
                  </CardTitle>
                  <CardDescription className="text-base leading-6">
                    {totals.listingCount}{" "}
                    {totals.listingCount === 1 ? "thing" : "things"} still for
                    sale.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-card">
                <CardHeader>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Mall keeps
                  </p>
                  <CardTitle className="font-heading text-3xl">
                    {formatMoney(totals.mallCut)}
                  </CardTitle>
                  <CardDescription className="text-base leading-6">
                    {feePercent}% taken from the stalls, not the buyer.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-card">
                <CardHeader>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Stalls are owed
                  </p>
                  <CardTitle className="font-heading text-3xl">
                    {formatMoney(totals.stallOwed)}
                  </CardTitle>
                  <CardDescription className="text-base leading-6">
                    The rest, still on paper.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <ul className="mt-8 grid gap-3">
              {rows.map((row) => (
                <li key={row.stall.id}>
                  <Card className="bg-card">
                    <CardHeader className="sm:grid-cols-[1fr_auto]">
                      <div>
                        <CardTitle className="font-heading text-2xl">
                          <Link
                            href={stallPath(row.stall.slug)}
                            className="underline-offset-4 hover:underline"
                          >
                            {row.stall.boothName}
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-base leading-6">
                          {row.listingCount === 0
                            ? "Nothing for sale on this table tonight."
                            : `${row.listingCount} ${row.listingCount === 1 ? "thing" : "things"} still on the table.`}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <dl className="grid gap-2 px-4 pb-4 text-sm sm:grid-cols-3">
                      <div className="flex justify-between gap-3 sm:block">
                        <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          On the tags
                        </dt>
                        <dd className="font-heading text-xl sm:mt-1">
                          {formatMoney(row.tag)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3 sm:block">
                        <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          Mall keeps
                        </dt>
                        <dd className="font-heading text-xl sm:mt-1">
                          {formatMoney(row.mallCut)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3 sm:block">
                        <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          Stall is owed
                        </dt>
                        <dd className="font-heading text-xl sm:mt-1">
                          {formatMoney(row.stallOwed)}
                        </dd>
                      </div>
                    </dl>
                    <p className="border-t border-border px-4 py-3 font-mono text-xs text-muted-foreground">
                      {row.mockDestination}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
      </MallSection>

      <MallSection>
        <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
          Still a stand-in.
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground text-pretty">
          No Connect onboarding. No tax engine. No warehouse. If the{" "}
          {feePercent}% from-the-stall cut is the deal you wanted, list
          something.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
            render={<Link href={feesPath()} />}
          >
            Read the cut
          </Button>
        </div>
      </MallSection>
    </div>
  );
}
