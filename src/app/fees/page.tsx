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
import { PLATFORM_FEE_BPS, platformFeeOn } from "@/lib/checkout";
import { formatMoney, money } from "@/lib/commerce";
import { advertisePath, feesPath, sellPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

const feePercent = PLATFORM_FEE_BPS / 100;
const sample = money(1000);
const mallCut = platformFeeOn(sample);
const stallKeeps = money(sample.amountCents - mallCut.amountCents);

export const metadata: Metadata = shareMetadata({
  title: "Fees",
  description: `The mall keeps ${feePercent}% from the stall, not on top of the buyer. Paid corners are labeled. We do not ship. Files are a listing type, not a host.`,
  path: feesPath(),
});

export default function FeesPage() {
  return (
    <div>
      <MallHero>
        <MallCrumb label="Fees">
          <CrumbSep />
          <span className="text-foreground">Fees</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Seller contract
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Same {feePercent}% the tote uses
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            The mall keeps {feePercent}%. That is the whole cut.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Read this before you put junk on a table. The cut comes from the
            stall, not on top of the buyer. Light you buy is labeled. We are
            not a warehouse and we do not host your files.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            size="lg"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href="#the-cut" />}
          >
            See a $10 example
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href={sellPath()} />}
          >
            Open a stall
          </Button>
        </div>
      </MallHero>

      <MallSection id="the-cut" className="border-b border-border">
        <MallEyebrow>The cut</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          {feePercent}% from the stall, not on top.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Checkout already keeps {feePercent}% of each stall’s subtotal — the
          same basis points the tote uses ({PLATFORM_FEE_BPS} of 10,000). A{" "}
          {formatMoney(sample)} tag means the buyer pays {formatMoney(sample)}.
          The mall retains {formatMoney(mallCut)}. The stall is owed{" "}
          {formatMoney(stallKeeps)}. Nothing extra is stacked at the register.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card className="bg-card">
            <CardHeader>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                On the tag
              </p>
              <CardTitle className="font-heading text-3xl">
                {formatMoney(sample)}
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
                {formatMoney(mallCut)}
              </CardTitle>
              <CardDescription className="text-base leading-6">
                {feePercent}% of {formatMoney(sample)}. Taken from the stall.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card">
            <CardHeader>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Stall is owed
              </p>
              <CardTitle className="font-heading text-3xl">
                {formatMoney(stallKeeps)}
              </CardTitle>
              <CardDescription className="text-base leading-6">
                The rest after the mall cut. Payouts are still on paper.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-6 text-muted-foreground">
          There is no second fee, no tax engine, and no Connect onboarding.
          You are listing on a table, not opening a merchant account.
        </p>
      </MallSection>

      <MallSection id="labeled-light">
        <MallEyebrow>Labeled light</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          Ads are products. Never stealth.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Featured stall, homepage takeover, and hub takeover sit on the rate
          card. Each one has a package, a window, and a stamp. Money buys
          light, not a rewrite, and it cannot look organic.
        </p>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          <li>
            <Card className="h-full bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                  Featured stall
                </CardTitle>
                <CardDescription className="text-base leading-6">
                  The good corner on the concourse. Labeled because someone
                  paid for it.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
          <li>
            <Card className="h-full bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                  Homepage takeover
                </CardTitle>
                <CardDescription className="text-base leading-6">
                  Fri–Mon light on the front door. A bought hero, not a lucky
                  find.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
          <li>
            <Card className="h-full bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                  Hub takeover
                </CardTitle>
                <CardDescription className="text-base leading-6">
                  One locked aisle, still wearing a stamp. Yard Sale will not
                  become artisan home.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
        </ul>
        <p className="mt-6 text-sm leading-6">
          <Link
            href={advertisePath()}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Read the rate card
          </Link>
          <span className="text-muted-foreground">
            {" "}
            — prices and the live stamps. This board does not rewrite that
            page.
          </span>
        </p>
      </MallSection>

      <MallSection
        id="physical"
        className="border-y border-border bg-card/60"
      >
        <MallEyebrow>Physical</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          We are not a warehouse.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          The mall is the building. The lamp stays with the booth. After
          someone pays, you arrange the handoff — driveway, porch, folding
          table. We do not pack, ship, or store your junk.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">
                Handoff is with the booth
              </CardTitle>
              <CardDescription className="text-base leading-6">
                Condition is the listing. “Tested, kinda” is valid copy. Sold
                stickers stay on the table so the next walker can see what
                left.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">
                No shipping desk
              </CardTitle>
              <CardDescription className="text-base leading-6">
                There is no back room, no carrier account, no “we’ll mail it
                Tuesday.” If you cannot hand it over, do not list it.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MallSection>

      <MallSection id="digital">
        <MallEyebrow>Digital</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          A file is a listing type, not a host.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          PDFs, beats, LUTs, and fonts sit on the same stall as the junk.
          Download Stall is an aisle, not a second website. Until a real host
          exists, delivery is a folder stand-in — a booth mock, not a CDN, not
          an email with the file attached.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">
                Same table as the junk
              </CardTitle>
              <CardDescription className="text-base leading-6">
                Format stands in for condition. The listing still belongs to
                the booth that sold the lamp. One stall can hold both kinds.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">
                Honest about delivery
              </CardTitle>
              <CardDescription className="text-base leading-6">
                We do not host your files tonight. A paid PDF lands in a
                stand-in folder. File-gone stays on the floor so nobody
                pretends the zine is still there.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MallSection>

      <MallSection className="border-t border-border">
        <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
          That is the board.
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground text-pretty">
          {feePercent}% from the stall. Labeled light if you buy a corner. No
          warehouse. No file host. If that is the deal you wanted, list
          something.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            size="lg"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href={sellPath()} />}
          >
            Put junk on a table
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href={advertisePath()} />}
          >
            Buy labeled light
          </Button>
        </div>
      </MallSection>
    </div>
  );
}
