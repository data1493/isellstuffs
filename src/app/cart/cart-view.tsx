"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { useCart } from "@/hooks/use-cart";
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
import { Separator } from "@/components/ui/separator";
import { addListingToCart, writeCartListingIds } from "@/lib/cart";
import { cartMix, groupListingsByStall, hubName, listingDetail } from "@/lib/checkout-display";
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
import { fulfillmentCopy, listingFact, listingFactLabel } from "@/lib/listing-display";
import { getStripe } from "@/lib/stripe-browser";

type CheckoutMode = "stripe-test" | "local-mock";

export function CartView({ initialAdd }: { initialAdd?: string }) {
  const router = useRouter();
  const cart = useCart();
  const listingIds = cart.listingIds;
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [paying, setPaying] = useState(false);
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

  async function pay() {
    setError(null);
    setPaying(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingIds: payable.map((line) => line.listing.id),
        }),
      });
      const data = (await response.json()) as {
        url?: string;
        sessionId?: string;
        mode?: CheckoutMode;
        error?: string;
      };
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout could not start.");
      }

      await getStripe();
      window.location.assign(data.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Checkout could not start.");
      setPaying(false);
    }
  }

  if (!mounted) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm text-muted-foreground">Pulling your tote off the hook…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 pb-28 sm:px-6 sm:py-14 lg:pb-14">
      <header className="max-w-2xl space-y-4">
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
        <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
          Your tote
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          One bag for the whole mall. You pay here; each stall is owed its cut
          after a 10% mall fee. Physical finds stay with the booth. Digital
          files land on the receipt.
        </p>
      </header>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.8fr)]">
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-heading text-2xl tracking-tight">In the tote</h2>
            <p className="text-sm text-muted-foreground">
              {payable.length === 0
                ? "Empty"
                : `${payable.length} ${payable.length === 1 ? "find" : "finds"} from ${groups.length} ${groups.length === 1 ? "stall" : "stalls"}`}
            </p>
          </div>

          {payable.length === 0 && gone.length === 0 ? (
            <Card className="border-dashed bg-card">
              <CardHeader className="gap-3">
                <CardTitle className="font-heading text-2xl">
                  The bag is slack.
                </CardTitle>
                <CardDescription className="text-base leading-6">
                  Add a find from a{" "}
                  <Link
                    href="/listings/ysk-wobbly-lamp"
                    className="underline-offset-4 hover:underline"
                  >
                    listing
                  </Link>{" "}
                  or{" "}
                  <Link
                    href="/stalls/folding-table-tuesday"
                    className="underline-offset-4 hover:underline"
                  >
                    stall
                  </Link>
                  — same bag those pages write. Or toss a stand-in SKU in from
                  the tables below.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          <ul className="space-y-6">
            {groups.map((group) => (
              <li key={group.stall.id} className="space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-heading text-lg tracking-tight">
                    {group.stall.boothName}
                  </h3>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Stall
                  </p>
                </div>
                <ul className="space-y-3">
                  {group.lines.map(({ listing }) => (
                    <li key={listing.id}>
                      <Card className="bg-card">
                        <CardHeader className="gap-3 sm:grid sm:grid-cols-[1fr_auto] sm:items-start">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">
                                {listing.type === "physical" ? "Hold it" : "Download"}
                              </Badge>
                              <Badge variant="secondary">{hubName(listing)}</Badge>
                            </div>
                            <CardTitle className="font-heading text-lg leading-snug">
                              {listing.title}
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
                        <CardFooter className="justify-between gap-3">
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
                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-base">{listing.title}</CardTitle>
                        <CardDescription>
                          {stall.boothName} ·{" "}
                          {listing.status === "sold" ? "Sold off the table" : "File gone"}{" "}
                          — left out of checkout.
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeListing(listing.id)}
                        >
                          Remove
                        </Button>
                      </CardFooter>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card className="bg-card shadow-sm">
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
            <CardFooter className="hidden flex-col items-stretch gap-2 lg:flex">
              <Button
                size="lg"
                className="rounded-full"
                disabled={payable.length === 0 || paying}
                onClick={() => void pay()}
              >
                {paying ? "Opening checkout…" : `Checkout · ${formatMoney(subtotal)}`}
              </Button>
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

      <section className="space-y-5">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Still on the tables
          </p>
          <h2 className="mt-2 font-heading text-2xl tracking-tight">
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
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {onTables.map((listing) => {
              const stall = stallById(listing.stallId);
              return (
                <li key={listing.id}>
                  <Card className="h-full bg-card">
                    <CardHeader className="gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {listing.type === "physical" ? "Hold it" : "Download"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {stall?.boothName}
                        </span>
                      </div>
                      <CardTitle className="font-heading text-base leading-snug">
                        {listing.title}
                      </CardTitle>
                      <CardDescription>{listingDetail(listing)}</CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-between">
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

      <p className="text-sm text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:text-foreground hover:underline">
          Back to the concourse
        </Link>
      </p>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 p-3 backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {payable.length === 0 ? "Tote is empty" : `You pay ${formatMoney(subtotal)}`}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {payable.length === 0
                ? "Grab something still on the tables"
                : `${groups.length} ${groups.length === 1 ? "stall" : "stalls"} · mall keeps ${formatMoney(mallCut)}`}
            </p>
          </div>
          <Button
            size="lg"
            className="rounded-full"
            disabled={payable.length === 0 || paying}
            onClick={() => void pay()}
          >
            {paying ? "Opening…" : "Checkout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
