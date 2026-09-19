import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  CHECKOUT_COOKIE,
  CHECKOUT_COOKIE_MAX_AGE,
  CheckoutError,
  parseCheckoutSession,
  serializeCheckoutSession,
} from "@/lib/checkout";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      sessionId?: unknown;
      action?: unknown;
      email?: unknown;
      name?: unknown;
    };

    const action = body.action;
    if (action !== "pay" && action !== "cancel") {
      throw new CheckoutError("Choose pay or cancel.");
    }

    const jar = await cookies();
    const session = parseCheckoutSession(jar.get(CHECKOUT_COOKIE)?.value);
    if (!session) {
      throw new CheckoutError("This checkout expired. Start again from the tote.");
    }

    if (typeof body.sessionId === "string" && body.sessionId !== session.id) {
      throw new CheckoutError("This checkout slip does not match.");
    }

    if (action === "cancel") {
      return NextResponse.json({
        url: `/checkout/cancel?session_id=${encodeURIComponent(session.id)}`,
      });
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!isEmail(email)) {
      throw new CheckoutError("Enter a real-looking email for the receipt.");
    }

    const next = {
      ...session,
      buyerEmail: email,
      buyerName: name || undefined,
    };

    jar.set(CHECKOUT_COOKIE, serializeCheckoutSession(next), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: CHECKOUT_COOKIE_MAX_AGE,
    });

    return NextResponse.json({
      url: `/checkout/success?session_id=${encodeURIComponent(session.id)}`,
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not finish checkout." }, { status: 502 });
  }
}
