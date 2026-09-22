import Stripe from "stripe";

import {
  buildCheckoutPlan,
  checkoutMode,
  integrationIdentifier,
  readStripeTestSecret,
  summarizePlan,
  type CheckoutSessionSummary,
} from "@/lib/checkout";

let stripeClient: Stripe | null = null;

function getStripeClient(secret: string): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(secret);
  }
  return stripeClient;
}

function mockSessionId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `cs_test_mock_${rand}`;
}

export async function createCheckoutSession(
  listingIds: string[],
  origin: string,
): Promise<{ url: string; session: CheckoutSessionSummary }> {
  const plan = buildCheckoutPlan(listingIds);
  const mode = checkoutMode();
  const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`;

  if (mode === "local-mock") {
    const session = summarizePlan(mockSessionId(), mode, plan);
    return {
      url: `${origin}/checkout/mock?session_id=${encodeURIComponent(session.id)}`,
      session,
    };
  }

  const secret = readStripeTestSecret();
  if (!secret) {
    const session = summarizePlan(mockSessionId(), "local-mock", plan);
    return {
      url: `${origin}/checkout/mock?session_id=${encodeURIComponent(session.id)}`,
      session,
    };
  }

  const stripe = getStripeClient(secret);
  const created = await stripe.checkout.sessions.create({
    mode: "payment",
    integration_identifier: integrationIdentifier(),
    success_url: successUrl,
    cancel_url: cancelUrl,
    // This account defaults to Managed Payments, which requires tax codes
    // and a registration. Keep Checkout as a plain test charge until then.
    managed_payments: { enabled: false },
    metadata: {
      charge_pattern: plan.chargePattern,
      listing_ids: plan.lines.map((line) => line.listing.id).join(","),
      platform_fee_cents: String(plan.platformFee.amountCents),
      stall_transfers: JSON.stringify(
        plan.sellerTransfers.map((transfer) => ({
          stallId: transfer.stallId,
          destination: transfer.mockConnectedAccountId,
          amount: transfer.transferAmount.amountCents,
        })),
      ),
    },
    line_items: plan.lines.map(({ listing, stall }) => ({
      quantity: 1,
      price_data: {
        currency: listing.price.currency,
        unit_amount: listing.price.amountCents,
        product_data: {
          name: listing.title,
          description:
            listing.type === "physical"
              ? `${stall.boothName} · ${listing.condition}`
              : `${stall.boothName} · ${listing.fileFormat}`,
          metadata: {
            listingId: listing.id,
            stallId: listing.stallId,
          },
        },
      },
    })),
  });

  if (!created.url) {
    throw new Error("Stripe Checkout did not return a URL.");
  }

  return {
    url: created.url,
    session: summarizePlan(created.id, "stripe-test", plan),
  };
}
