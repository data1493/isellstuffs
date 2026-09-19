import Link from "next/link";

import { CampaignGoods } from "@/components/ads/campaign-goods";
import { CampaignReceipt } from "@/components/ads/campaign-receipt";
import { LabeledChip, PaidStamp } from "@/components/ads/paid-stamp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adKindCopy, liveSurfaces } from "@/lib/ads-display";
import type { CampaignLander } from "@/lib/booked-campaign";
import { stallById } from "@/lib/commerce";
import { advertisePath, stallPath } from "@/lib/paths";

export function HomepageCampaignLander({
  lander,
}: {
  lander: CampaignLander;
}) {
  const { slot, stallName } = lander;
  const stall = slot.stallId ? stallById(slot.stallId) : undefined;
  const kind = adKindCopy[slot.kind];
  const surfaces = liveSurfaces(slot).filter(
    (surface) => !surface.href.startsWith("/campaigns"),
  );

  return (
    <div>
      <section className="border-b border-border bg-[oklch(0.27_0.035_42)] text-[oklch(0.97_0.015_85)]">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[oklch(0.86_0.1_75)] text-[oklch(0.25_0.04_45)]">
                Paid placement
              </Badge>
              <Badge
                variant="outline"
                className="border-current/30 text-current"
              >
                {kind.product}
              </Badge>
              <LabeledChip />
            </div>
            <PaidStamp />
          </div>

          <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-current/55">
            Bought campaign · {slot.window}
          </p>
          <h1 className="mt-3 max-w-3xl font-heading text-4xl leading-[1.08] tracking-tight text-balance sm:text-6xl">
            {slot.headline}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-current/75 text-pretty sm:text-lg">
            This is not a stall page and it is not organic. {stallName} paid
            for the homepage hero and this URL. The mall stamped it.
            {lander.fromBooking
              ? " You bought the URL. You did not replace the mall pitch."
              : null}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="rounded-full bg-[oklch(0.86_0.1_75)] px-5 text-[oklch(0.25_0.04_45)] hover:bg-[oklch(0.82_0.1_75)]"
              render={<Link href="/" />}
            >
              See it on the concourse
            </Button>
            {stall ? (
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-current/30 bg-transparent px-5 text-current hover:bg-current/10 hover:text-current"
                render={<Link href={stallPath(stall.slug)} />}
              >
                {stall.boothName}
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-[oklch(0.22_0.03_42)] text-[oklch(0.97_0.015_85)]">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <CampaignReceipt slot={slot} stallName={stallName} tone="ink" />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-current/55">
              What the money bought
            </p>
            <h2 className="mt-2 font-heading text-3xl tracking-tight text-balance">
              A hero, a stamp, and this page.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-current/75 text-pretty">
              {kind.includes} {kind.cannotBuy} Package copy is{" "}
              {slot.packageName} for {slot.window} — a product, not a
              whisper in the directory.
            </p>
            <ul className="mt-6 space-y-3">
              {surfaces.map((surface) => (
                <li key={surface.href}>
                  <Link
                    href={surface.href}
                    className="group flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                  >
                    <span className="underline-offset-4 group-hover:underline">
                      {surface.label}
                    </span>
                    <span className="text-xs text-current/55">
                      {surface.note}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Their table this window
          </p>
          <h2 className="mt-2 font-heading text-3xl tracking-tight sm:text-4xl">
            What they paid to push.
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
            Physical jewel-case leftover and the files from under the same
            table. A campaign does not invent a second storefront.
          </p>
          <div className="mt-8">
            <CampaignGoods stallId={slot.stallId} />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
            Want a corner like this?
          </h2>
          <p className="max-w-xl text-muted-foreground">
            The rate card lists featured stalls and takeovers. These
            windows are already sold. There is no ad checkout — walk the
            stamps on the floor, then read what they cost.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              className="rounded-full px-5"
              render={<Link href={advertisePath()} />}
            >
              Mall rate card
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href="/" />}
            >
              Home concourse
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
