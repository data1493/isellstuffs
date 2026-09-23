import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import { PayForm } from "@/app/checkout/mock/pay-form";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallWidth } from "@/components/mall-shell";
import { MallNotice } from "@/components/mall-notice";
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
import {
  CHECKOUT_COOKIE,
  formatPlanMoney,
  parseCheckoutSession,
} from "@/lib/checkout";
import { cartMix, groupListingsByStall, listingDetail } from "@/lib/checkout-display";
import {
  CHECKOUT_HOURS_COPY,
  checkoutHoursForStall,
} from "@/lib/checkout-hours";
import { listingById } from "@/lib/commerce";
import { checkoutMockMetadata } from "@/lib/seo";

export const metadata: Metadata = checkoutMockMetadata();

export default async function MockCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[]; error?: string | string[] }>;
}) {
  const params = await searchParams;
  const sessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id;
  const confirmError = Array.isArray(params.error) ? params.error[0] : params.error;
  const jar = await cookies();
  const session = parseCheckoutSession(jar.get(CHECKOUT_COOKIE)?.value);
  const match = session && (!sessionId || session.id === sessionId) ? session : null;

  if (!match) {
    return (
      <MallNotice
        tone="cancel"
        eyebrow="Expired slip"
        title="This checkout went cold."
        body="Start again from the tote. Nothing was charged. You do not need a Stripe secret to pay in test mode."
        actions={
          <>
            <Button className="rounded-full px-5" render={<Link href="/cart" />}>
              Back to tote
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-5"
              render={<Link href="/" />}
            >
              Concourse
            </Button>
          </>
        }
      />
    );
  }

  const listings = match.listingIds
    .map((id) => listingById(id))
    .filter((listing): listing is NonNullable<typeof listing> => Boolean(listing));
  const groups = groupListingsByStall(match.listingIds);
  const mix = cartMix(listings);

  return (
    <div>
      <section className="border-b border-border bg-[linear-gradient(180deg,var(--card),var(--background))]">
        <MallWidth className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <header className="space-y-4">
              <MallCrumb label="Checkout">
                <CrumbSep />
                <Link href="/cart" className="hover:text-foreground hover:underline">
                  Tote
                </Link>
                <CrumbSep />
                <span className="text-foreground">Pay</span>
              </MallCrumb>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full">
                  Mall checkout
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  Test · Stripe.js
                </Badge>
              </div>
              <h1 className="font-heading text-4xl tracking-tight sm:text-5xl">
                Pay the mall
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                One charge for every stall in the tote. The mall keeps 10%. Each
                booth is owed the rest. No live onboarding, no live payouts.
              </p>
            </header>

            <Card className="bg-card">
              <CardHeader className="sr-only">
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <PayForm session={match} confirmError={confirmError} />
              </CardContent>
            </Card>
          </div>

          <aside className="lg:sticky lg:top-24">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Your slip</CardTitle>
                <CardDescription>
                  {mix.physical > 0
                    ? `${mix.physical} to pick up`
                    : null}
                  {mix.physical > 0 && mix.digital > 0 ? " · " : null}
                  {mix.digital > 0 ? `${mix.digital} to download` : null}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {groups.map((group) => {
                  const pickup = checkoutHoursForStall(
                    match.listingIds,
                    group.stall.id,
                  );

                  return (
                    <div key={group.stall.id} className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        {group.stall.boothName}
                      </p>
                      {pickup ? (
                        <p
                          data-checkout-hours=""
                          data-checkout-hours-stall={group.stall.id}
                          className="text-xs leading-5 text-muted-foreground"
                        >
                          <span data-checkout-hours-text="">{pickup.hours}</span>
                          {" · "}
                          <span data-checkout-hours-place="">
                            {pickup.place}
                          </span>
                          <span className="mt-0.5 block">
                            {CHECKOUT_HOURS_COPY}
                          </span>
                        </p>
                      ) : null}
                      <ul className="space-y-3">
                        {group.lines.map(({ listing }) => (
                          <li
                            key={listing.id}
                            className="flex justify-between gap-3 text-sm"
                          >
                            <span>
                              <span className="block font-medium leading-5">
                                {listing.title}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {listingDetail(listing)}
                              </span>
                            </span>
                            <span className="shrink-0 font-heading">
                              {formatPlanMoney(
                                listing.price.amountCents,
                                listing.price.currency,
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPlanMoney(match.subtotalCents, match.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mall cut (kept)</span>
                    <span>
                      {formatPlanMoney(match.platformFeeCents, match.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="font-medium">You pay</span>
                    <span className="font-heading text-2xl">
                      {formatPlanMoney(match.subtotalCents, match.currency)}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-secondary/40 px-3 py-3 ring-1 ring-primary/10">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Owed to stalls
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {match.transfers.map((transfer) => (
                      <li key={transfer.stallId} className="flex justify-between gap-3">
                        <span>{transfer.boothName}</span>
                        <span>
                          {formatPlanMoney(transfer.amountCents, match.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </aside>
        </MallWidth>
      </section>
    </div>
  );
}
