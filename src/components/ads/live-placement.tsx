import Link from "next/link";

import { PaidStamp } from "@/components/ads/paid-stamp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  adKindCopy,
  landerForSlot,
  liveSurfaces,
} from "@/lib/ads-display";
import {
  formatMoney,
  stallById,
  type AdSlot,
} from "@/lib/commerce";
import { stallPath } from "@/lib/paths";

export function LivePlacement({ slot }: { slot: AdSlot }) {
  const stall = stallById(slot.stallId);
  const kind = adKindCopy[slot.kind];
  const surfaces = liveSurfaces(slot);
  const lander = landerForSlot(slot);

  return (
    <article className="flex h-full flex-col rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Paid placement</Badge>
          <Badge variant="outline">{kind.product}</Badge>
        </div>
        <PaidStamp className="text-primary" />
      </div>

      <h3 className="mt-4 font-heading text-xl tracking-tight text-balance sm:text-2xl">
        {slot.headline}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground text-pretty">
        {slot.blurb}
      </p>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {stall?.boothName ?? slot.stallId}
        {" · "}
        {slot.packageName}
        {" · "}
        {slot.window}
        {" · "}
        {formatMoney(slot.price)} to sit here
      </p>

      <ul className="mt-5 space-y-2">
        {surfaces.map((surface) => (
          <li key={surface.href}>
            <Link
              href={surface.href}
              className="group flex items-baseline justify-between gap-3 text-sm"
            >
              <span className="text-foreground underline-offset-4 group-hover:underline">
                {surface.label}
              </span>
              <span className="text-right text-xs text-muted-foreground">
                {surface.note}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-2">
        {stall ? (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            render={<Link href={stallPath(stall.slug)} />}
          >
            {stall.boothName}
          </Button>
        ) : null}
        {lander ? (
          <Button
            size="sm"
            className="rounded-full"
            render={<Link href={lander} />}
          >
            Open the campaign
          </Button>
        ) : null}
      </div>
    </article>
  );
}
