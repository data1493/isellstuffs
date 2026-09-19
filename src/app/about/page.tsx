import type { Metadata } from "next";
import Link from "next/link";

import { PaidStamp } from "@/components/ads/paid-stamp";
import { JsonLd } from "@/components/json-ld";
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
import { hubFloorList, mallHubs } from "@/lib/commerce";
import {
  aboutPath,
  advertisePath,
  feesPath,
  sellPath,
  thisWeekPath,
} from "@/lib/paths";
import { aboutMetadata, absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

const feePercent = PLATFORM_FEE_BPS / 100;

export const metadata: Metadata = aboutMetadata();

function aboutJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${site.name}`,
    description: site.description,
    url: absoluteUrl(aboutPath()),
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: absoluteUrl("/"),
    },
  };
}

export default function AboutPage() {
  return (
    <div>
      <JsonLd data={aboutJsonLd()} />
      <MallHero>
        <MallCrumb label="About">
          <CrumbSep />
          <span className="text-foreground">About</span>
        </MallCrumb>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            The story
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Physical + digital
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
            This is a flea-market mall.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {site.name} is a building for independent stalls — not a shop, not
            a warehouse, not a file host. Walk the aisles. Buy a lamp from one
            booth and a PDF from the next. The mall keeps {feePercent}%. Paid
            corners wear a stamp.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            size="lg"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href="/explore" />}
          >
            Walk the floor
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
      </MallHero>

      <MallSection id="the-mall" className="border-b border-border">
        <MallEyebrow>The building</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          Many stalls. One mall.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Someone asked what this site is. It is a flea market with a roof.
          Each seller keeps a booth. The mall is the floor, the tote, and the{" "}
          {feePercent}% cut — not the inventory. You are not buying from a
          single storefront. You are buying from Folding Table Tuesday,
          Half-Working, Gift Desk, and whoever taped a new card this weekend.
        </p>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          <li>
            <Card className="h-full bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                  Not a shop
                </CardTitle>
                <CardDescription className="text-base leading-6">
                  One vendor with a catalog is a storefront. This is a
                  concourse. The booths stay themselves.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
          <li>
            <Card className="h-full bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                  Not a warehouse
                </CardTitle>
                <CardDescription className="text-base leading-6">
                  The lamp stays with the booth. After you pay, you arrange
                  the handoff. We do not pack or ship.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
          <li>
            <Card className="h-full bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                  Not a file host
                </CardTitle>
                <CardDescription className="text-base leading-6">
                  A PDF sits on the same table as the junk. Delivery is a
                  booth folder, not a CDN and not an email blast.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
        </ul>
      </MallSection>

      <MallSection id="same-table">
        <MallEyebrow>The tables</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          Physical and digital share a stall.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          A cracked Game Boy and a parking-lot LUT pack can sit on the same
          table. Condition is a first-class field. Format stands in for
          condition when the thing is a file. Sold stickers stay on the
          floor. File-gone stays too — nobody pretends the zine is still
          there.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="bg-card">
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                Physical
              </Badge>
              <CardTitle className="mt-2 font-heading text-2xl">
                Things you can hold
              </CardTitle>
              <CardDescription className="text-base leading-6">
                Lamps, windbreakers, dented lids. “Tested, kinda” is valid
                copy. Handoff is with the booth — driveway, porch, folding
                table.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card">
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                Digital
              </Badge>
              <CardTitle className="mt-2 font-heading text-2xl">
                Things you can download
              </CardTitle>
              <CardDescription className="text-base leading-6">
                PDFs, beats, LUTs, fonts, a mall gift card. Same stall as
                the junk. Download Stall is an aisle, not a second website.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MallSection>

      <MallSection
        id="the-cut"
        className="border-y border-border bg-card/60"
      >
        <MallEyebrow>The cut</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          The mall keeps {feePercent}%. The buyer pays the tag.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          That cut comes from the stall, not stacked on top of the tote. The
          price on the listing is the price at the register. This page is
          the story, not the seller contract — the board has the worked
          example and the payout paper.
        </p>
        <p className="mt-6 text-sm leading-6">
          <Link
            href={feesPath()}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Read the cut
          </Link>
          <span className="text-muted-foreground">
            {" "}
            — {feePercent}% from the stall, labeled ads, no warehouse. We do
            not reprint that board here.
          </span>
        </p>
      </MallSection>

      <MallSection id="labeled">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <MallEyebrow>Paid corners</MallEyebrow>
            <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
              If someone bought the light, it says so.
            </h2>
          </div>
          <PaidStamp className="text-primary" />
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Featured stall, homepage takeover, and hub takeover are products on
          the rate card. Money buys a corner, not a rewrite. There is no
          stealth sponsored row. A bought hero still wears the stamp.
        </p>
        <p className="mt-6 text-sm leading-6">
          <Link
            href={advertisePath()}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            See the rate card
          </Link>
          <span className="text-muted-foreground">
            {" "}
            — packages, windows, and the live stamps. This story does not
            rewrite that page.
          </span>
        </p>
      </MallSection>

      <MallSection id="first-walk" className="border-t border-border">
        <MallEyebrow>First Saturday</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          Start on the concourse.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          {hubFloorList()}. Those aisles have rules — what belongs, and what
          gets walked back to the door. The catalog on the floor is a
          stand-in. The rules are not.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          <li>
            <Card className="h-full bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                  <Link
                    href="/explore"
                    className="underline-offset-4 hover:underline"
                  >
                    Explore
                  </Link>
                </CardTitle>
                <CardDescription className="text-base leading-6">
                  The general floor. Filter by hub or physical versus digital.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
          <li>
            <Card className="h-full bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                  <Link
                    href="/hubs"
                    className="underline-offset-4 hover:underline"
                  >
                    Hubs
                  </Link>
                </CardTitle>
                <CardDescription className="text-base leading-6">
                  {mallHubs.map((hub) => hub.name).join(", ")}. Each aisle
                  refuses the wrong inventory.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
          <li>
            <Card className="h-full bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                  <Link
                    href={thisWeekPath()}
                    className="underline-offset-4 hover:underline"
                  >
                    This week
                  </Link>
                </CardTitle>
                <CardDescription className="text-base leading-6">
                  Weekend mall picks. A mix of objects and files — never sold
                  or file-gone, never a paid stamp.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
          <li>
            <Card className="h-full bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                  <Link
                    href={sellPath()}
                    className="underline-offset-4 hover:underline"
                  >
                    Sell
                  </Link>
                </CardTitle>
                <CardDescription className="text-base leading-6">
                  Put junk on a table. No account. The {feePercent}% cut and
                  labeled-ad rule are the deal.
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
        </ul>
      </MallSection>

      <MallSection className="border-t border-border bg-card/60">
        <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
          That is the site.
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground text-pretty">
          A flea-market mall. Physical and digital from the same table.{" "}
          {feePercent}% from the stall. Paid corners labeled. If someone
          sent you this page, walk the floor. If you came to list, the
          contract is on the board.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            size="lg"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href="/explore" />}
          >
            Explore the concourse
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
      </MallSection>
    </div>
  );
}
