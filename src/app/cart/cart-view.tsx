"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/hooks/use-cart";
import { ListingMediaPlaceholder } from "@/components/listing-media-placeholder";
import { ListingTypeBadge } from "@/components/listing-type-badge";
import { CrumbSep, MallCrumb } from "@/components/mall-crumb";
import { MallEyebrow, MallWidth } from "@/components/mall-shell";
import { MallNotice, MallPayError } from "@/components/mall-notice";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { addListingToCart, writeCartListingIds } from "@/lib/cart";
import { cartMix, groupListingsByStall, listingDetail } from "@/lib/checkout-display";
import { platformFeeOn } from "@/lib/checkout";
import {
  addMoney,
  cartEligibleListings,
  formatMoney,
  isCartEligible,
  listingById,
  money,
  stallById,
} from "@/lib/commerce";
import {
  fulfillmentCopy,
  listingFact,
  listingFactLabel,
  listingHubName,
} from "@/lib/listing-display";
import { listingPath, stallPath } from "@/lib/paths";
import { getStripe } from "@/lib/stripe-browser";
import { cn } from "@/lib/utils";

type CheckoutMode = "stripe-test" | "local-mock";

export function CartView({
  initialAdd,
  initialListingIds = [],
}: {
  initialAdd?: string;
  initialListingIds?: string[];
}) {
  const router = useRouter();
  const cart = useCart(initialListingIds);
  const listingIds = cart.listingIds;
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<CheckoutMode | null>(null);
  const [stripeJs, setStripeJs] = useState(false);

  useEffect(() => {
    if (!initialAdd) {
      return;
    }
    addListingToCart(initialAdd);
    router.replace("/cart");
  }, [initialAdd, router]);

  useEffect(() => {
    void getStripe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/checkout")
      .then((response) => response.json())
      .then((data: { mode?: CheckoutMode; stripeJs?: boolean }) => {
        if (cancelled) {
          return;
        }
        if (data.mode === "stripe-test" || data.mode === "local-mock") {
          setMode(data.mode);
        }
        setStripeJs(data.stripeJs === true);
      })
      .catch(() => {
        if (!cancelled) {
          setMode("local-mock");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const lines = useMemo(() => {
    return listingIds.flatMap((id) => {
      const listing = listingById(id);
      if (!listing) {
        return [];
      }
      const stall = stallById(listing.stallId);
      if (!stall) {
        return [];
      }
      return [{ listing, stall, eligible: isCartEligible(listing) }];
    });
  }, [listingIds]);

  const payable = lines.filter((line) => line.eligible);
  const gone = lines.filter((line) => !line.eligible);
  const payableListings = payable.map((line) => line.listing);
  const groups = groupListingsByStall(payable.map((line) => line.listing.id));
  const mix = cartMix(payableListings);
  const subtotal = payableListings.reduce(
    (sum, listing) => addMoney(sum, listing.price),
    money(0),
  );
  const mallCut = platformFeeOn(subtotal);

  const onTables = cartEligibleListings().filter(
    (listing) => !listingIds.includes(listing.id),
  );

  function addListing(id: string) {
    cart.add(id);
    setError(null);
  }

  function removeListing(id: string) {
    writeCartListingIds(listingIds.filter((item) => item !== id));
    setError(null);
  }

  const bagEmpty = payable.length === 0 && gone.length === 0;

  const checkoutFields = payable.map((line) => (
    <input
      key={line.listing.id}
      type="hidden"
      name="listingId"
      value={line.listing.id}
    />
  ));

  return (
    <div
      className={
        bagEmpty
          ? "pb-0"
          : "pb-28 lg:pb-0"
      }
    >
      <section className="border-b border-border bg-[linear-gradient(180deg,var(--card),var(--background))]">
        <MallWidth className="flex flex-col gap-6 py-12 sm:py-16">
          <MallCrumb label="Tote">
            <CrumbSep />
            <span className="text-foreground">Tote</span>
          </MallCrumb>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full">
              {mode === "stripe-test" ? "Stripe test Checkout" : "Mall checkout · test"}
            </Badge>
            {stripeJs ? (
              <Badge variant="outline" className="rounded-full">
                Stripe.js ready
              </Badge>
            ) : null}
          </div>
          <div className="max-w-2xl space-y-3">
            <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
              Your tote
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              One bag for the whole mall. You pay here; each stall is owed its cut
              after a 10% mall fee. Physical finds stay with the booth. Digital
              files land on the receipt.
            </p>
          </div>
        </MallWidth>
      </section>

      <MallWidth className="flex flex-col gap-12 py-12 sm:py-16">
        {error ? <MallPayError body={error} /> : null}

        {bagEmpty ? (
          <MallNotice
            padded={false}
            tone="empty"
            eyebrow="Empty tote"
            title="The bag is slack."
            body="Nothing in here yet. Add a find from a listing or a stall — same bag those pages write — or toss a stand-in SKU in from the tables below."
            actions={
              <>
                <Button
                  className="rounded-full px-5"
                  render={<Link href="/listings/ysk-wobbly-lamp" />}
                >
                  Open a listing
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-5"
                  render={<Link href="/stalls/folding-table-tuesday" />}
                >
                  Visit a stall
                </Button>
              </>
            }
          />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.8fr)]">
            <section className="space-y-5">
              <div className="flex items-end justify-between gap-3">
                <h2 className="font-heading text-2xl tracking-tight">In the tote</h2>
                <p className="text-sm text-muted-foreground">
                  {`${payable.length} ${payable.length === 1 ? "find" : "finds"} from ${groups.length} ${groups.length === 1 ? "stall" : "stalls"}`}
                </p>
              </div>

              <ul className="space-y-6">
                {groups.map((group) => (
                  <li key={group.stall.id} className="space-y-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-heading text-lg tracking-tight">
                        <Link
                          href={stallPath(group.stall.slug)}
                          className="underline-offset-4 hover:underline"
                        >
                          {group.stall.boothName}
                        </Link>
                      </h3>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Stall
                      </p>
                    </div>
                    <ul className="space-y-3">
                      {group.lines.map(({ listing }) => (
                        <li key={listing.id}>
                          <Card className="gap-0 bg-card py-0">
                            <div className="grid sm:grid-cols-[9.5rem_minmax(0,1fr)]">
                              <Link
                                href={listingPath(listing.id)}
                                className="min-w-0"
                              >
                                <ListingMediaPlaceholder
                                  listing={listing}
                                  compact
                                  className="rounded-none rounded-t-xl border-0 border-b border-dashed sm:h-full sm:min-h-[9.5rem] sm:rounded-none sm:rounded-l-xl sm:border-b-0 sm:border-r sm:aspect-auto"
                                />
                              </Link>
                              <div className="min-w-0">
                                <CardHeader className="gap-3 pt-4 sm:grid sm:grid-cols-[1fr_auto] sm:items-start">
                                  <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <ListingTypeBadge listing={listing} />
                                      <Badge variant="outline">
                                        {listingHubName(listing)}
                                      </Badge>
                                    </div>
                                    <CardTitle className="font-heading text-lg leading-snug">
                                      <Link
                                        href={listingPath(listing.id)}
                                        className="underline-offset-4 hover:underline"
                                      >
                                        {listing.title}
                                      </Link>
                                    </CardTitle>
                                    <CardDescription className="leading-6">
                                      {listing.summary}
                                    </CardDescription>
                                    <p className="text-sm text-foreground/80">
                                      {listingFactLabel(listing)}: {listingFact(listing)}
                                    </p>
                                  </div>
                                  <p className="font-heading text-xl">
                                    {formatMoney(listing.price)}
                                  </p>
                                </CardHeader>
                                <CardFooter className="justify-between gap-3 border-0 bg-transparent">
                                  <p className="text-xs leading-5 text-muted-foreground">
                                    {fulfillmentCopy(listing)}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeListing(listing.id)}
                                  >
                                    Take out
                                  </Button>
                                </CardFooter>
                              </div>
                            </div>
                          </Card>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>

              {gone.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-heading text-xl tracking-tight">Already gone</h3>
                  <ul className="space-y-3">
                    {gone.map(({ listing, stall }) => (
                      <li key={listing.id}>
                        <Card className="gap-0 bg-muted/50 py-0">
                          <div className="grid sm:grid-cols-[9.5rem_minmax(0,1fr)]">
                            <ListingMediaPlaceholder
                              listing={listing}
                              compact
                              className="rounded-none rounded-t-xl border-0 border-b border-dashed opacity-70 sm:h-full sm:min-h-[7rem] sm:rounded-none sm:rounded-l-xl sm:border-b-0 sm:border-r sm:aspect-auto"
                            />
                            <div>
                              <CardHeader>
                                <CardTitle className="text-base">{listing.title}</CardTitle>
                                <CardDescription>
                                  {stall.boothName} ·{" "}
                                  {listing.status === "sold" ? "Sold off the table" : "File gone"}{" "}
                                  — left out of checkout.
                                </CardDescription>
                              </CardHeader>
                              <CardFooter className="border-0 bg-transparent">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeListing(listing.id)}
                                >
                                  Remove
                                </Button>
                              </CardFooter>
                            </div>
                          </div>
                        </Card>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Pay the mall</CardTitle>
                  <CardDescription className="leading-6">
                    One checkout for every stall in the bag. The charge hits the
                    platform; each booth is owed its remainder. Test only — no live
                    Connect onboarding.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mix.physical > 0 || mix.digital > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {mix.physical > 0
                        ? `${mix.physical} physical ${mix.physical === 1 ? "find" : "finds"}`
                        : null}
                      {mix.physical > 0 && mix.digital > 0 ? " · " : null}
                      {mix.digital > 0
                        ? `${mix.digital} digital ${mix.digital === 1 ? "file" : "files"}`
                        : null}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Mall cut (kept)</span>
                    <span>{formatMoney(mallCut)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-medium">You pay today</span>
                    <span className="font-heading text-2xl">{formatMoney(subtotal)}</span>
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground">
                    The 10% is not added on top. Sellers are owed{" "}
                    {formatMoney(money(subtotal.amountCents - mallCut.amountCents))}{" "}
                    across the stalls in this tote.
                  </p>
                </CardContent>
                <CardFooter className="hidden flex-col items-stretch gap-2 border-0 bg-transparent lg:flex">
                  <form action="/cart/pay" method="post" className="flex flex-col">
                    {checkoutFields}
                    <button
                      type="submit"
                      disabled={payable.length === 0}
                      className={cn(buttonVariants({ size: "lg" }), "rounded-full")}
                    >
                      {`Checkout · ${formatMoney(subtotal)}`}
                    </button>
                  </form>
                  <p className="text-center text-xs leading-5 text-muted-foreground">
                    {mode === "stripe-test"
                      ? "Stripe.js sends you to Stripe test Checkout."
                      : stripeJs
                        ? "No secret key — Stripe.js opens a local test pay wall."
                        : "Local test pay wall. Add a test secret later for hosted Checkout."}
                  </p>
                </CardFooter>
              </Card>
            </aside>
          </div>
        )}

        <section className="space-y-5">
          <div className="max-w-2xl">
            <MallEyebrow>Still on the tables</MallEyebrow>
            <h2 className="mt-2 font-heading text-2xl tracking-tight sm:text-3xl">
              Grab a stand-in find
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              These are the cart-eligible SKUs from the stand-in catalog. Sold
              chairs and vanished files stay off the table.
            </p>
          </div>

          {onTables.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Everything still for sale is already in the tote.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {onTables.map((listing) => {
                const stall = stallById(listing.stallId);
                return (
                  <li key={listing.id}>
                    <Card className="h-full gap-0 bg-card py-0">
                      <Link href={listingPath(listing.id)}>
                        <ListingMediaPlaceholder
                          listing={listing}
                          compact
                          className="rounded-none rounded-t-xl border-0 border-b border-dashed"
                        />
                      </Link>
                      <CardHeader className="gap-2 pt-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <ListingTypeBadge listing={listing} />
                          <span className="text-xs text-muted-foreground">
                            {stall?.boothName}
                          </span>
                        </div>
                        <CardTitle className="font-heading text-base leading-snug">
                          <Link
                            href={listingPath(listing.id)}
                            className="underline-offset-4 hover:underline"
                          >
                            {listing.title}
                          </Link>
                        </CardTitle>
                        <CardDescription>{listingDetail(listing)}</CardDescription>
                      </CardHeader>
                      <CardFooter className="justify-between border-0 bg-transparent">
                        <span className="font-heading text-lg">
                          {formatMoney(listing.price)}
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="rounded-full"
                          onClick={() => addListing(listing.id)}
                        >
                          Toss in
                        </Button>
                      </CardFooter>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </MallWidth>

      {bagEmpty ? null : (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                You pay {formatMoney(subtotal)}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {`${groups.length} ${groups.length === 1 ? "stall" : "stalls"} · mall keeps ${formatMoney(mallCut)}`}
              </p>
            </div>
            <form action="/cart/pay" method="post">
              {checkoutFields}
              <button
                type="submit"
                disabled={payable.length === 0}
                className={cn(buttonVariants({ size: "lg" }), "rounded-full")}
              >
                Checkout
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
