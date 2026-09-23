import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

function readTestPublishableKey(): string | null {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  if (!key) {
    return null;
  }
  if (key.startsWith("pk_live_")) {
    return null;
  }
  if (key.startsWith("pk_test_")) {
    return key;
  }
  return null;
}

export function isStripeJsConfigured(): boolean {
  return readTestPublishableKey() !== null;
}

/** Stripe.js for the browser. Test publishable key only — never a live key. */
export function getStripe(): Promise<Stripe | null> {
  const key = readTestPublishableKey();
  if (!key) {
    return Promise.resolve(null);
  }
  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}
