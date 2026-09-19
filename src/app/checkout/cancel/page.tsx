import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CHECKOUT_COOKIE, formatPlanMoney, parseCheckoutSession } from "@/lib/checkout";
import { groupListingsByStall } from "@/lib/checkout-display";
import { checkoutCancelMetadata } from "@/lib/seo";

export const metadata: Metadata = checkoutCancelMetadata();

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const params = await searchParams;
  const sessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id;
  const jar = await cookies();
  const session = parseCheckoutSession(jar.get(CHECKOUT_COOKIE)?.value);
  const groups = session ? groupListingsByStall(session.listingIds) : [];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-4">
        <Badge variant="outline" className="w-fit rounded-full">
          Walked away
        </Badge>
        <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
          You put the bag back on the hook.
        </h1>
        <p className="max-w-xl text-base leading-7 text-muted-foreground">
          Nothing was charged. The tote still holds whatever you picked up.
          Come back when you are ready to pay the mall.
        </p>
      </header>

      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Still waiting</CardTitle>
          <CardDescription>
            {session
              ? `${session.listingIds.length} ${session.listingIds.length === 1 ? "find" : "finds"} · ${formatPlanMoney(session.subtotalCents, session.currency)}`
              : "Open the tote to try checkout again."}
          </CardDescription>
        </CardHeader>
        {groups.length > 0 ? (
          <CardContent className="space-y-4">
            {groups.map((group) => (
              <div key={group.stall.id}>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {group.stall.boothName}
                </p>
                <ul className="mt-1 space-y-1 text-sm">
                  {group.lines.map(({ listing }) => (
                    <li key={listing.id}>{listing.title}</li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="font-mono text-xs text-muted-foreground">
              {sessionId ?? session?.id}
            </p>
          </CardContent>
        ) : null}
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button className="rounded-full" render={<Link href="/cart" />}>
          Return to tote
        </Button>
        <Button variant="outline" className="rounded-full" render={<Link href="/" />}>
          Concourse
        </Button>
      </div>
    </div>
  );
}
