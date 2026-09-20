import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LOT_PACKED_COPY, type LotBooth } from "@/lib/lot-board";
import { stallPath } from "@/lib/paths";

function stillHereLabel(count: number) {
  if (count === 1) {
    return "1 still here";
  }
  return `${count} still here`;
}

export function LotBoothCard({ row }: { row: LotBooth }) {
  const { stall, packed, presence, stillHerePhysical, aisle, giftDesk } = row;

  return (
    <article
      data-lot-presence={presence}
      data-stall-id={stall.id}
      className="min-w-0"
    >
      <Card className="h-full gap-0 overflow-hidden py-0 ring-1 ring-foreground/10">
        <div
          className={
            packed
              ? "border-b border-dashed border-border bg-muted/50 px-5 py-5"
              : "border-b border-dashed border-border bg-[oklch(0.96_0.02_85)] px-5 py-5"
          }
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-foreground/60">
            {aisle ?? "Independent stall"}
          </p>
          <h3 className="mt-1 font-heading text-2xl tracking-tight">
            {stall.boothName}
          </h3>
          <Badge
            variant={packed ? "secondary" : "outline"}
            className="mt-3 rounded-full"
          >
            {packed ? "Off the lot" : "On the lot"}
          </Badge>
        </div>
        <CardHeader className="pt-4">
          <CardTitle className="sr-only">{stall.boothName}</CardTitle>
          <CardDescription className="text-pretty text-sm leading-6 text-foreground/80">
            {stall.blurb}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-5">
          {packed ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {LOT_PACKED_COPY}
            </p>
          ) : giftDesk ? (
            <p className="text-sm leading-6 text-muted-foreground">
              Codes stay on the desk.
            </p>
          ) : stillHerePhysical === 0 ? (
            <p className="text-sm leading-6 text-muted-foreground">
              Nothing physical still here.
            </p>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              {stillHereLabel(stillHerePhysical)}
              {stillHerePhysical === 1
                ? " — a thing you can hold."
                : " — things you can hold."}
            </p>
          )}
          <Link
            href={stallPath(stall.slug)}
            className="inline-block text-sm underline-offset-4 hover:underline"
          >
            Open the stall
          </Link>
        </CardContent>
      </Card>
    </article>
  );
}
