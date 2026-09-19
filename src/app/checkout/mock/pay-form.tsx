"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { MallPayError } from "@/components/mall-notice";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AS_IS_CHECK_LABEL,
  AS_IS_REJECT,
  slipHasPhysicalLines,
} from "@/lib/as-is";
import { formatPlanMoney, type CheckoutSessionSummary } from "@/lib/checkout";
import {
  CARD_HELP,
  CARD_LABEL,
  CASH_HELP,
  CASH_LABEL,
  readMockTender,
  slipAllowsCash,
  writeMockTender,
} from "@/lib/driveway-tender";
import { getStripe, isStripeJsConfigured } from "@/lib/stripe-browser";
import { cn } from "@/lib/utils";

const TEST_SUCCESS = "4242424242424242";
const TEST_DECLINE: Record<string, string> = {
  "4000000000000002": "The test card was declined.",
  "4000000000009995": "Insufficient funds on this test card.",
  "4000000000000069": "This test card is expired.",
};

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function formatCardNumber(value: string): string {
  return digitsOnly(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

function isFutureExpiry(value: string): boolean {
  const digits = digitsOnly(value);
  if (digits.length !== 4) {
    return false;
  }
  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2));
  if (month < 1 || month > 12) {
    return false;
  }
  const now = new Date();
  const exp = new Date(year, month);
  return exp > now;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function PayForm({
  session,
  confirmError,
}: {
  session: CheckoutSessionSummary;
  confirmError?: string;
}) {
  const stripeConfigured = isStripeJsConfigured();
  const [stripeReady, setStripeReady] = useState<"loading" | "ready" | "missing">(
    stripeConfigured ? "loading" : "missing",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [postal, setPostal] = useState("");
  const [busy, setBusy] = useState<"pay" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(confirmError ?? null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [asIs, setAsIs] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const needsAsIs = useMemo(
    () => slipHasPhysicalLines(session.listingIds),
    [session.listingIds],
  );
  const canPayCash = useMemo(
    () => slipAllowsCash(session.listingIds),
    [session.listingIds],
  );

  useEffect(() => {
    if (!stripeConfigured) {
      return;
    }
    let cancelled = false;
    getStripe()
      .then((stripe) => {
        if (!cancelled) {
          setStripeReady(stripe ? "ready" : "missing");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStripeReady("missing");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [stripeConfigured]);

  useEffect(() => {
    const form = formRef.current;
    if (!form || !canPayCash) {
      return;
    }

    const cashRadio = () =>
      form.querySelector<HTMLInputElement>("[data-tender-cash]");
    const cardFields = () =>
      form.querySelector<HTMLFieldSetElement>("[data-test-card]");

    const paint = () => {
      const cashOn = cashRadio()?.checked === true;
      const fields = cardFields();
      if (fields) {
        fields.hidden = cashOn;
        fields.disabled = cashOn;
      }
      const next = cashOn ? "cash" : "card";
      if (readMockTender(session.id) !== next) {
        writeMockTender(session.id, next);
      }
    };

    if (readMockTender(session.id) === "cash") {
      const radio = cashRadio();
      if (radio) {
        radio.checked = true;
      }
    }
    paint();

    const onClick = () => {
      window.setTimeout(paint, 0);
    };
    form.addEventListener("click", onClick);
    form.addEventListener("change", paint);
    const timer = window.setInterval(paint, 150);
    return () => {
      form.removeEventListener("click", onClick);
      form.removeEventListener("change", paint);
      window.clearInterval(timer);
    };
  }, [canPayCash, session.id]);

  const total = useMemo(
    () => formatPlanMoney(session.subtotalCents, session.currency),
    [session.currency, session.subtotalCents],
  );

  async function submit(action: "pay" | "cancel") {
    setError(null);
    setFieldError(null);

    if (action === "pay") {
      if (!isEmail(email)) {
        setFieldError("Enter an email for the stall slips.");
        return;
      }
      if (readMockTender(session.id) === "card") {
        const pan = digitsOnly(card);
        if (pan.length < 16) {
          setFieldError("Enter the full test card number.");
          return;
        }
        if (!isFutureExpiry(expiry)) {
          setFieldError("Use a future expiration.");
          return;
        }
        if (digitsOnly(cvc).length < 3) {
          setFieldError("Enter the CVC.");
          return;
        }
        if (digitsOnly(postal).length < 5) {
          setFieldError("Enter a 5-digit ZIP.");
          return;
        }
        const declined = TEST_DECLINE[pan];
        if (declined) {
          setError(declined);
          return;
        }
        if (pan !== TEST_SUCCESS) {
          setError("Use Stripe’s test card 4242 4242 4242 4242, or a documented decline card.");
          return;
        }
      }
      if (needsAsIs && !asIs) {
        setError(AS_IS_REJECT);
        return;
      }
    }

    setBusy(action);
    try {
      const response = await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          action,
          email,
          name,
          asIs: asIs ? "1" : undefined,
          tender: canPayCash ? readMockTender(session.id) : "card",
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not finish checkout.");
      }
      window.location.assign(data.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not finish checkout.");
      setBusy(null);
    }
  }

  return (
    <form
      ref={formRef}
      className="space-y-6 [&:has([data-tender-cash]:checked)_[data-test-card]]:hidden"
      action="/api/checkout/confirm"
      method="post"
    >
      <input type="hidden" name="sessionId" value={session.id} />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          {stripeReady === "ready"
            ? "Stripe.js loaded in test mode."
            : stripeReady === "loading"
              ? "Loading Stripe.js…"
              : "Stripe.js did not load. The form still finishes locally."}
        </p>
        <p>No live charges.</p>
      </div>

      <fieldset className="space-y-3">
        <legend className="font-heading text-xl tracking-tight">Contact</legend>
        <div className="space-y-1.5">
          <Label htmlFor="buyer-name">Name on the slip</Label>
          <Input
            id="buyer-name"
            name="name"
            autoComplete="name"
            placeholder="Ada from aisle 3"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-10 bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="buyer-email">Email for the receipt</Label>
          <Input
            id="buyer-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-10 bg-background"
          />
        </div>
      </fieldset>

      {canPayCash ? (
        <fieldset className="space-y-3" data-driveway-tender="">
          <legend className="font-heading text-xl tracking-tight">
            How you’ll pay
          </legend>
          <p className="text-sm leading-6 text-muted-foreground">
            Driveway money can be cash on the table. Card is still test theater.
          </p>
          <label className="flex w-full cursor-pointer items-start gap-3 text-sm leading-6">
            <input
              type="radio"
              name="tender"
              value="cash"
              data-tender-cash=""
              defaultChecked={false}
              className="mt-1 size-4 shrink-0 accent-foreground"
            />
            <span>
              <span className="block font-medium text-foreground">{CASH_LABEL}</span>
              <span className="block text-muted-foreground">{CASH_HELP}</span>
            </span>
          </label>
          <label className="flex w-full cursor-pointer items-start gap-3 text-sm leading-6">
            <input
              type="radio"
              name="tender"
              value="card"
              defaultChecked
              className="mt-1 size-4 shrink-0 accent-foreground"
            />
            <span>
              <span className="block font-medium text-foreground">{CARD_LABEL}</span>
              <span className="block text-muted-foreground">{CARD_HELP}</span>
            </span>
          </label>
        </fieldset>
      ) : (
        <input type="hidden" name="tender" value="card" />
      )}

      <fieldset data-test-card="" className="space-y-3">
        <legend className="font-heading text-xl tracking-tight">Test card</legend>
        <p className="text-sm leading-6 text-muted-foreground">
          This wall stands in for Stripe-hosted Checkout until a test secret is
          set. Stripe.js is on the page. The card never hits a live processor.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="card-number">Card number</Label>
          <Input
            id="card-number"
            name="card"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4242 4242 4242 4242"
            value={card}
            onChange={(event) => setCard(formatCardNumber(event.target.value))}
            className="h-10 bg-background font-mono tracking-wide"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="card-exp">Expiration</Label>
            <Input
              id="card-exp"
              name="expiry"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM / YY"
              value={expiry}
              onChange={(event) => setExpiry(formatExpiry(event.target.value))}
              className="h-10 bg-background font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-cvc">CVC</Label>
            <Input
              id="card-cvc"
              name="cvc"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              value={cvc}
              onChange={(event) => setCvc(digitsOnly(event.target.value).slice(0, 4))}
              className="h-10 bg-background font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-zip">ZIP</Label>
            <Input
              id="card-zip"
              name="postal"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="97214"
              value={postal}
              onChange={(event) => setPostal(digitsOnly(event.target.value).slice(0, 5))}
              className="h-10 bg-background font-mono"
            />
          </div>
        </div>
      </fieldset>

      {needsAsIs ? (
        <label className="flex w-full cursor-pointer items-start gap-3 text-sm leading-6">
          <input
            type="checkbox"
            name="asIs"
            value="1"
            checked={asIs}
            onChange={(event) => setAsIs(event.target.checked)}
            className="mt-1 size-4 shrink-0 accent-foreground"
          />
          <span>{AS_IS_CHECK_LABEL}</span>
        </label>
      ) : null}

      {fieldError ? (
        <p role="alert" className="text-sm text-destructive">
          {fieldError}
        </p>
      ) : null}
      {error ? <MallPayError body={error} /> : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          name="action"
          value="pay"
          disabled={busy !== null || stripeReady === "loading"}
          className={cn(buttonVariants({ size: "lg" }), "rounded-full sm:flex-1")}
        >
          {busy === "pay" ? "Taking the slip…" : `Pay ${total}`}
        </button>
        <button
          type="submit"
          name="action"
          value="cancel"
          formNoValidate
          disabled={busy !== null}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}
        >
          {busy === "cancel" ? "Leaving…" : "Cancel"}
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/cart" className="underline-offset-4 hover:underline">
          Return to tote without paying
        </Link>
      </p>
    </form>
  );
}
