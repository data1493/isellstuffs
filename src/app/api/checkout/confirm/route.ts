import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  assertPhysicalAsIs,
  readAsIsFlag,
  stampAsIs,
} from "@/lib/as-is";
import {
  CHECKOUT_COOKIE,
  CHECKOUT_COOKIE_MAX_AGE,
  CheckoutError,
  parseCheckoutSession,
  serializeCheckoutSession,
} from "@/lib/checkout";
import {
  assertDrivewayTender,
  readTender,
  stampTender,
} from "@/lib/driveway-tender";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function requestOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    return `${forwardedProto ?? "http"}://${forwardedHost}`;
  }
  const origin = request.headers.get("origin");
  if (origin) {
    return origin;
  }
  return request.nextUrl.origin;
}

async function readBody(request: NextRequest): Promise<{
  sessionId?: unknown;
  action?: unknown;
  email?: unknown;
  name?: unknown;
  asIs?: unknown;
  tender?: unknown;
  asForm: boolean;
}> {
  const contentType = request.headers.get("content-type") ?? "";
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.formData();
    return {
      sessionId: form.get("sessionId"),
      action: form.get("action"),
      email: form.get("email"),
      name: form.get("name"),
      asIs: form.get("asIs"),
      tender: form.get("tender"),
      asForm: true,
    };
  }

  const body = (await request.json()) as {
    sessionId?: unknown;
    action?: unknown;
    email?: unknown;
    name?: unknown;
    asIs?: unknown;
    tender?: unknown;
  };
  return { ...body, asForm: false };
}

function reply(
  asForm: boolean,
  origin: string,
  payload: { url?: string; error?: string },
  status = 200,
) {
  if (asForm) {
    const target = payload.url
      ? new URL(payload.url, origin)
      : new URL("/checkout/mock", origin);
    if (payload.error) {
      target.searchParams.set("error", payload.error);
    }
    return NextResponse.redirect(target, 303);
  }
  return NextResponse.json(
    payload.url ? { url: payload.url } : { error: payload.error },
    { status },
  );
}

export async function POST(request: NextRequest) {
  const origin = requestOrigin(request);
  let asForm = false;

  try {
    const body = await readBody(request);
    asForm = body.asForm;

    const action = body.action;
    if (action !== "pay" && action !== "cancel") {
      throw new CheckoutError("Choose pay or cancel.");
    }

    const jar = await cookies();
    const session = parseCheckoutSession(jar.get(CHECKOUT_COOKIE)?.value);
    if (!session) {
      throw new CheckoutError("This checkout expired. Start again from the tote.");
    }

    if (
      typeof body.sessionId === "string" &&
      body.sessionId.length > 0 &&
      body.sessionId !== session.id
    ) {
      throw new CheckoutError("This checkout slip does not match.");
    }

    if (action === "cancel") {
      return reply(asForm, origin, {
        url: `/checkout/cancel?session_id=${encodeURIComponent(session.id)}`,
      });
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!isEmail(email)) {
      throw new CheckoutError("Enter a real-looking email for the receipt.");
    }

    const asIs = readAsIsFlag(body.asIs);
    assertPhysicalAsIs(session.listingIds, asIs);

    const tender = readTender(body.tender);
    assertDrivewayTender(session.listingIds, tender);

    const next = stampTender(
      asIs
        ? stampAsIs({
            ...session,
            buyerEmail: email,
            buyerName: name || undefined,
          })
        : {
            ...session,
            buyerEmail: email,
            buyerName: name || undefined,
          },
      tender,
    );

    jar.set(CHECKOUT_COOKIE, serializeCheckoutSession(next), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: CHECKOUT_COOKIE_MAX_AGE,
    });

    return reply(asForm, origin, {
      url: `/checkout/success?session_id=${encodeURIComponent(session.id)}`,
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return reply(asForm, origin, { error: error.message }, error.status);
    }
    return reply(asForm, origin, { error: "Could not finish checkout." }, 502);
  }
}
