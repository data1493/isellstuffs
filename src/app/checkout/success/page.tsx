import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import { ClearCart } from "@/app/checkout/success/clear-cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CHECKOUT_COOKIE, formatPlanMoney, parseCheckoutSession } from "@/lib/checkout";
import { cartMix, groupListingsByStall, listingDetail } from "@/lib/checkout-display";
import { listingById } from "@/lib/commerce";
import { checkoutSuccessMetadata } from "@/lib/seo";

export const metadata: Metadata = checkoutSuccessMetadata();

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const params = await searchParams;
  const sessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id;

  const jar = await cookies();
  const stored = parseCheckoutSession(jar.get(CHECKOUT_COOKIE)?.value);
  const session =
    stored && sessionId && stored.id !== sessionId ? null : stored;
  const listings = (session?.listingIds ?? [])
    .map((id) => listingById(id))
    .filter((listing): listing is NonNullable<typeof listing> => Boolean(listing));
  const groups = session ? groupListingsByStall(session.listingIds) : [];
  const mix = cartMix(listings);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
      <ClearCart active={Boolean(sessionId || stored)} />
      <header className="space-y-4">
        <Badge variant="secondary" className="w-fit rounded-full">
          {session?.mode === "stripe-test" ? "Stripe test payment" : "Paid · test"}
        </Badge>
        <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
          You’re on the slip.
        </h1>
        <p className="max-w-xl text-base leading-7 text-muted-foreground">
          {session?.buyerName ? `${session.buyerName}, the` : "The"} mall took
          the test charge
          {session?.buyerEmail ? ` and filed a slip for ${session.buyerEmail}` : ""}.
          Nothing live moved. Stalls are owed their cut on paper.
        </p>
      </header>

      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Receipt</CardTitle>
          <CardDescription className="font-mono text-xs">
            {sessionId ?? session?.id ?? "no session"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {session ? (
            <>
              {groups.map((group) => (
                <div key={group.stall.id} className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {group.stall.boothName}
                  </p>
                  <ul className="space-y-3">
                    {group.lines.map(({ listing }) => (
                      <li key={listing.id} className="flex justify-between gap-3 text-sm">
                        <span>
                          <span className="block font-medium">{listing.title}</span>
                          <span className="block text-xs text-muted-foreground">
                            {listing.type === "physical"
                              ? `Pick up · ${listingDetail(listing)}`
                              : `Download stand-in · ${listingDetail(listing)}`}
                          </span>
                        </span>
                        <span className="font-heading">
                          {formatPlanMoney(
                            listing.price.amountCents,
                            listing.price.currency,
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-heading text-xl">
                    {formatPlanMoney(session.subtotalCents, session.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mall kept</span>
                  <span>
                    {formatPlanMoney(session.platformFeeCents, session.currency)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-muted/60 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Intended stall transfers
                </p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {session.transfers.map((transfer) => (
                    <li key={transfer.stallId} className="flex justify-between gap-3">
                      <span>
                        {transfer.boothName}
                        <span className="block text-xs text-muted-foreground">
                          {transfer.destination}
                        </span>
                      </span>
                      <span>
                        {formatPlanMoney(transfer.amountCents, session.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Checkout finished, but this tab does not have the slip. The tote
              still clears.
            </p>
          )}
        </CardContent>
      </Card>

      {mix.physical > 0 || mix.digital > 0 ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {mix.physical > 0 ? (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-base">Physical finds</CardTitle>
                <CardDescription className="leading-6">
                  Arrange handoff with the stall. The mall does not ship from a
                  warehouse in this wave.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}
          {mix.digital > 0 ? (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-base">Digital files</CardTitle>
                <CardDescription className="leading-6">
                  Downloads are a stand-in — no file host yet. The receipt is
                  your proof the booth sold you the format.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button className="rounded-full" render={<Link href="/cart" />}>
          Shop another aisle
        </Button>
        <Button variant="outline" className="rounded-full" render={<Link href="/" />}>
          Concourse
        </Button>
      </div>
    </div>
  );
}
