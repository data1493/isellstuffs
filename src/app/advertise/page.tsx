import type { Metadata } from "next";
import Link from "next/link";

import { AdvertiseEmpty } from "@/components/ads/advertise-empty";
import { LivePlacement } from "@/components/ads/live-placement";
import { PackageCard } from "@/components/ads/package-card";
import { PaidStamp } from "@/components/ads/paid-stamp";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  campaignLanderPath,
  yardSaleTuesdayLanderPath,
} from "@/lib/ads-display";
import {
  adSlots,
  adSlotsByKind,
  formatMoney,
} from "@/lib/commerce";
import { advertiseBookPath, advertisePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Advertise",
  description:
    "Buy a labeled corner: featured stall, homepage takeover, or hub takeover. The mall does not hide paid light.",
  path: advertisePath(),
});

const rules = [
  {
    title: "Always labeled",
    body: "Every paid corner wears a stamp. No stealth sponsored rows. If you cannot say you bought it, you cannot sit there.",
  },
  {
    title: "A product, not a whisper",
    body: "Featured stalls and takeovers have a package name, a window, and a price. They look bought because they were.",
  },
  {
    title: "Hub rules stay",
    body: "Money buys light, not a rewrite. Yard Sale will not become artisan home because a booth paid $18.",
  },
  {
    title: "Sold stays sold",
    body: "You cannot buy “available.” A folding chair that already left the driveway keeps the sticker.",
  },
];

export default function AdvertisePage() {
  const featured = adSlotsByKind("featured-stall");
  const homepage = adSlotsByKind("homepage-takeover");
  const hubs = adSlotsByKind("hub-takeover");
  const packages = [...homepage, ...featured, ...hubs];
  const empty = packages.length === 0;

  return (
    <div>
      <MallHero>
          <MallCrumb label="Advertise">
            <CrumbSep />
            <span className="text-foreground">Advertise</span>
          </MallCrumb>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              Mall media, not a shop
            </Badge>
            <Badge variant="outline" className="rounded-full">
              Labeled on purpose
            </Badge>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl space-y-4">
              <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-6xl">
                Buy a corner. We will label it.
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Stalls pay to sit in the good light. Featured booths, homepage
                takeovers, hub takeovers — each one is a product with a
                window and a price. The concourse does not pretend a bought
                hero is a lucky find.
              </p>
            </div>
            <PaidStamp className="text-primary" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="rounded-full px-5"
              render={<Link href={advertiseBookPath()} />}
            >
              Book next weekend
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-5"
              render={<Link href="#rate-card" />}
            >
              Read the rate card
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-5"
              render={<Link href={campaignLanderPath} />}
            >
              See a bought campaign
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-5"
              render={<Link href={yardSaleTuesdayLanderPath} />}
            >
              See the aisle campaign
            </Button>
          </div>
      </MallHero>

      <MallSection id="rate-card" className="border-b border-border">
          <MallEyebrow>Rate card</MallEyebrow>
          <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
            Three things you can buy.
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
            Prices are package copy from the stand-in catalog — not a billing
            integration, not a Stripe ad checkout. These three windows are
            already sold.
          </p>

          {empty ? (
            <div className="mt-10">
              <AdvertiseEmpty />
            </div>
          ) : (
            <ul className="mt-10 grid gap-4 lg:grid-cols-3">
              {packages.map((slot) => (
                <li key={slot.id}>
                  <PackageCard slot={slot} />
                </li>
              ))}
            </ul>
          )}
      </MallSection>

      <MallSection id="live">
          <MallEyebrow>Live this window</MallEyebrow>
          <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
            Walk the floor. The money already landed.
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
            Home, explore, and the Yard Sale aisle already wear these
            placements. This page does not restyle them — it points at the
            corners that were bought.
          </p>

          {empty ? (
            <div className="mt-10">
              <AdvertiseEmpty />
            </div>
          ) : (
            <ul className="mt-10 grid gap-4 lg:grid-cols-3">
              {adSlots.map((slot) => (
                <li key={slot.id}>
                  <LivePlacement slot={slot} />
                </li>
              ))}
            </ul>
          )}
      </MallSection>

      <MallSection className="border-y border-border bg-card/60">
        <div className="grid gap-8 md:grid-cols-2">
          {rules.map((rule, index) => (
            <article key={rule.title}>
              <p className="font-heading text-4xl text-primary">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-2 font-heading text-2xl tracking-tight">
                {rule.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {rule.body}
              </p>
            </article>
          ))}
        </div>
      </MallSection>

      <MallSection className="border-b border-border">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <MallEyebrow>Booking</MallEyebrow>
            <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
              This window is sold. Next weekend is on the card.
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground text-pretty">
              Half-Working Electronics paid the good corner. Beats Under the
              Table bought the homepage and a campaign URL. Folding Table
              Tuesday owns Yard Sale this weekend — and bought a campaign URL
              for the aisle. Book the next window from the card — labeled,
              priced, no stealth.
            </p>
            <div className="mt-5">
              <Button
                className="rounded-full px-5"
                render={<Link href={advertiseBookPath()} />}
              >
                Book next weekend
              </Button>
            </div>
          </div>
          <div className="rounded-2xl bg-secondary/50 p-5 ring-1 ring-primary/15">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              What the money bought
            </p>
            {packages.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                No packages on the card this window.
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm leading-6">
                {packages.map((slot) => (
                  <li key={slot.id} className="flex justify-between gap-3">
                    <span>{slot.packageName}</span>
                    <span className="font-heading">
                      {formatMoney(slot.price)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </MallSection>

      <MallSection>
          <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
            See the bought pages.
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Beats Under the Table paid for a Fri–Mon lander. Folding Table
            Tuesday paid for a Yard Sale URL. Both read like receipts, not
            blog posts.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              className="rounded-full px-5"
              render={<Link href={campaignLanderPath} />}
            >
              Open the homepage campaign
            </Button>
            <Button
              className="rounded-full px-5"
              render={<Link href={yardSaleTuesdayLanderPath} />}
            >
              Open the aisle campaign
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href="/" />}
            >
              Home concourse
            </Button>
          </div>
      </MallSection>
    </div>
  );
}
