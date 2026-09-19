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
import { adKindCopy } from "@/lib/ads-display";
import { formatMoney } from "@/lib/commerce";
import type { NextWindowPackage } from "@/lib/ad-booking";
import { advertiseBookPath } from "@/lib/paths";

export function BookPackageCard({ pack }: { pack: NextWindowPackage }) {
  const kind = adKindCopy[pack.kind];

  return (
    <Card className="h-full bg-card">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Next window</Badge>
            <Badge variant="outline">{kind.product}</Badge>
          </div>
          <PaidStamp className="text-primary" />
        </div>
        <CardTitle className="mt-2 font-heading text-2xl tracking-tight text-balance">
          {pack.packageName}
        </CardTitle>
        <CardDescription className="text-pretty leading-6">
          {pack.blurb}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-heading text-3xl tracking-tight">
            {formatMoney(pack.price)}
          </p>
          <p className="text-right text-xs leading-5 text-muted-foreground">
            {pack.window}
            <span className="block">Always labeled</span>
          </p>
        </div>
        <p className="text-sm leading-6 text-foreground/80">{kind.cannotBuy}</p>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button
          className="w-full rounded-full sm:w-auto"
          render={<Link href={advertiseBookPath(pack.kind)} />}
        >
          Book this corner
        </Button>
      </CardFooter>
    </Card>
  );
}
