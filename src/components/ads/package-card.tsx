import Link from "next/link";

import { PaidStamp } from "@/components/ads/paid-stamp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { adKindCopy, liveSurfaces } from "@/lib/ads-display";
import { formatMoney, stallById, type AdSlot } from "@/lib/commerce";
import { advertiseBookPath } from "@/lib/paths";

export function PackageCard({ slot }: { slot: AdSlot }) {
  const kind = adKindCopy[slot.kind];
  const stall = stallById(slot.stallId);
  const surfaces = liveSurfaces(slot);
  const primary = surfaces[0];

  return (
    <Card className="h-full bg-card">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Paid placement</Badge>
            <Badge variant="outline">{kind.product}</Badge>
          </div>
          <PaidStamp className="text-primary" />
        </div>
        <CardTitle className="mt-2 font-heading text-2xl tracking-tight text-balance">
          {slot.packageName}
        </CardTitle>
        <CardDescription className="text-pretty leading-6">
          {kind.includes}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-heading text-3xl tracking-tight">
            {formatMoney(slot.price)}
          </p>
          <p className="text-right text-xs leading-5 text-muted-foreground">
            {slot.window}
            <span className="block">Package copy, not a charge</span>
          </p>
        </div>
        <p className="text-sm leading-6 text-foreground/80">{kind.cannotBuy}</p>
        <p className="text-xs leading-5 text-muted-foreground">
          Sold this window to {stall?.boothName ?? slot.stallId}.
        </p>
      </CardContent>
      <CardFooter className="mt-auto flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap">
        <Button
          className="w-full rounded-full sm:w-auto"
          render={<Link href={advertiseBookPath(slot.kind)} />}
        >
          Book the next window
        </Button>
        {primary ? (
          <Button
            variant="outline"
            className="w-full rounded-full sm:w-auto"
            render={<Link href={primary.href} />}
          >
            See it live
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
