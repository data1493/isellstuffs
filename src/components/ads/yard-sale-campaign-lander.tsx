import Link from "next/link";

import { CampaignGoods } from "@/components/ads/campaign-goods";
import { CampaignReceipt } from "@/components/ads/campaign-receipt";
import { LabeledChip, PaidStamp } from "@/components/ads/paid-stamp";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallHero, MallSection } from "@/components/mall-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  adKindCopy,
  campaignLanderPath,
  liveSurfaces,
} from "@/lib/ads-display";
import type { CampaignLander } from "@/lib/booked-campaign";
import { hubById, stallById } from "@/lib/commerce";
import { advertiseBookPath, advertisePath, stallPath } from "@/lib/paths";

export function YardSaleCampaignLander({
  lander,
}: {
  lander: CampaignLander;
}) {
  const { slot, stallName } = lander;
  const stall = slot.stallId ? stallById(slot.stallId) : undefined;
  const hub = slot.hubId ? hubById(slot.hubId) : undefined;
  const kind = adKindCopy[slot.kind];
  const surfaces = liveSurfaces(slot).filter(
    (surface) => !surface.href.startsWith("/campaigns"),
  );

  return (
    <div>
      <MallHero className="bg-[linear-gradient(180deg,oklch(0.93_0.04_75),oklch(0.96_0.02_80))]">
        <MallCrumb label="Yard Sale campaign">
          <CrumbSep />
          <Link
            href={advertisePath()}
            className="hover:text-foreground hover:underline"
          >
            Advertise
          </Link>
          <CrumbSep />
          <span className="text-foreground">Yard Sale campaign</span>
        </MallCrumb>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Paid placement</Badge>
            <Badge variant="outline">{kind.product}</Badge>
            <LabeledChip />
          </div>
          <PaidStamp className="text-primary" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <MallEyebrow>Bought campaign · {slot.window}</MallEyebrow>
            <h1 className="mt-3 max-w-3xl font-heading text-4xl leading-[1.08] tracking-tight text-balance sm:text-6xl">
              {slot.headline}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/80 text-pretty sm:text-lg">
              This is not a hub page and it is not organic. {stallName} paid
              for the {hub?.name ?? "aisle"} hero and this URL. The mall
              stamped it. Money buys light, not a rewrite — the driveway
              rule stays.
              {lander.fromBooking
                ? " You bought light on this floor. Yard Sale is still a driveway."
                : null}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {hub ? (
                <Button
                  size="lg"
                  className="rounded-full px-5"
                  render={<Link href={hub.href} />}
                >
                  See it on the aisle
                </Button>
              ) : null}
              {stall ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-5"
                  render={<Link href={stallPath(stall.slug)} />}
                >
                  {stall.boothName}
                </Button>
              ) : null}
            </div>
          </div>

          <CampaignReceipt slot={slot} stallName={stallName} />
        </div>
      </MallHero>

      <MallSection className="border-b border-border">
        <MallEyebrow>What the money bought</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight text-balance sm:text-4xl">
          An aisle, a stamp, and this page.
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground text-pretty">
          {kind.includes} {kind.cannotBuy} Package copy is {slot.packageName}{" "}
          for {slot.window} — a product, not a whisper in the directory.
        </p>
        <ul className="mt-8 space-y-3">
          {surfaces.map((surface) => (
            <li key={surface.href}>
              <Link
                href={surface.href}
                className="group flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
              >
                <span className="underline-offset-4 group-hover:underline">
                  {surface.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {surface.note}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </MallSection>

      <MallSection className="border-b border-border">
        <MallEyebrow>Their table this window</MallEyebrow>
        <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
          What they paid to push.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Driveway leftovers and the one-page pricing PDF from the same
          booth. A campaign does not invent a second storefront.
        </p>
        <div className="mt-8">
          <CampaignGoods stallId={slot.stallId} />
        </div>
      </MallSection>

      <MallSection>
        <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
          Want a corner like this?
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          This window is sold. Next weekend is on the card. Beats Under the
          Table already bought a homepage URL. These pages exist because
          someone paid — they do not look organic.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            className="rounded-full px-5"
            render={<Link href={advertisePath()} />}
          >
            Mall rate card
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={advertiseBookPath()} />}
          >
            Book next weekend
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={campaignLanderPath} />}
          >
            Homepage campaign
          </Button>
        </div>
      </MallSection>
    </div>
  );
}
