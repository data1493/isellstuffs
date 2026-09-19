import { LabeledChip, PaidStamp } from "@/components/ads/paid-stamp";
import { ListingGrid } from "@/components/browse/cards";
import { Badge } from "@/components/ui/badge";
import {
  formatMoney,
  listingsByStall,
  stallById,
  type AdSlot,
} from "@/lib/commerce";

const kindCopy = {
  "featured-stall": "Featured stall",
  "homepage-takeover": "Homepage takeover",
  "hub-takeover": "Hub takeover",
} as const;

function CampaignMeta({ slot }: { slot: AdSlot }) {
  const stall = stallById(slot.stallId);

  return (
    <p className="text-xs leading-5 text-current/70">
      {stall?.boothName ?? slot.stallId}
      {" · "}
      {slot.packageName}
      {" · "}
      {slot.window}
      {" · "}
      {formatMoney(slot.price)} to sit here
    </p>
  );
}

export function HomepageTakeover({ slot }: { slot: AdSlot }) {
  const stall = stallById(slot.stallId);
  const goods = listingsByStall(slot.stallId);

  return (
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
              {kindCopy[slot.kind]}
            </Badge>
            <LabeledChip className="text-current/60" />
          </div>
          <PaidStamp />
        </div>
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-current/55">
          {stall?.boothName ?? slot.stallId} bought the hero
        </p>
        <h2 className="mt-2 max-w-3xl font-heading text-3xl leading-[1.1] tracking-tight text-balance sm:text-5xl">
          {slot.headline}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-current/75 text-pretty">
          {slot.blurb} {stall?.blurb}
        </p>
        <div className="mt-4">
          <CampaignMeta slot={slot} />
        </div>
        {goods.length > 0 ? (
          <div className="mt-8 text-foreground">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-current/60">
              Their table this window
            </p>
            <ListingGrid listings={goods} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function FeaturedBooth({
  slot,
  eyebrow = "The good corner",
}: {
  slot: AdSlot;
  eyebrow?: string;
}) {
  const stall = stallById(slot.stallId);
  const goods = listingsByStall(slot.stallId);

  return (
    <section className="border-y border-border bg-[oklch(0.93_0.04_75)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
              {eyebrow}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge>Paid placement</Badge>
              <Badge variant="outline">{kindCopy[slot.kind]}</Badge>
            </div>
            <h2 className="mt-4 max-w-3xl font-heading text-3xl tracking-tight text-balance sm:text-4xl">
              {slot.headline}
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
              {slot.blurb}
              {stall ? ` ${stall.blurb}` : null}
            </p>
            <div className="mt-3">
              <CampaignMeta slot={slot} />
            </div>
          </div>
          <PaidStamp />
        </div>
        {goods.length > 0 ? (
          <div className="mt-8">
            <ListingGrid listings={goods} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function HubTakeover({ slot }: { slot: AdSlot }) {
  const stall = stallById(slot.stallId);

  return (
    <div className="overflow-hidden rounded-2xl bg-[oklch(0.3_0.04_42)] px-5 py-6 text-[oklch(0.97_0.015_85)] sm:px-7 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-[oklch(0.86_0.1_75)] text-[oklch(0.25_0.04_45)]">
            Paid placement
          </Badge>
          <Badge variant="outline" className="border-current/30 text-current">
            {kindCopy[slot.kind]}
          </Badge>
        </div>
        <PaidStamp />
      </div>
      <h2 className="mt-5 font-heading text-2xl tracking-tight text-balance sm:text-3xl">
        {slot.headline}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-current/75 text-pretty">
        {slot.blurb}
        {stall ? ` ${stall.blurb}` : null}
      </p>
      <div className="mt-3">
        <CampaignMeta slot={slot} />
      </div>
    </div>
  );
}
