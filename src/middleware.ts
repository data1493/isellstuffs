import { NextResponse, type NextRequest } from "next/server";

/** GET /sell/taken is the page. POST /sell/taken writes the scribble. */
/** GET /pickup/here is the notice. POST /pickup/here writes the here flag. */
/** GET /cart/shake is the desk. POST /cart/shake drops sold/packed/ghosts. */
/** GET /sell/rain is the form. POST /sell/rain tapes the Sunday card. */
export const runtime = "nodejs";

export function middleware(request: NextRequest) {
  if (request.method === "POST" && request.nextUrl.pathname === "/sell/taken") {
    const url = request.nextUrl.clone();
    url.pathname = "/sell/taken/write";
    return NextResponse.rewrite(url);
  }

  if (request.method === "POST" && request.nextUrl.pathname === "/pickup/here") {
    const url = request.nextUrl.clone();
    url.pathname = "/pickup/here/write";
    return NextResponse.rewrite(url);
  }

  if (request.method === "POST" && request.nextUrl.pathname === "/cart/shake") {
    const url = request.nextUrl.clone();
    url.pathname = "/cart/shake/write";
    return NextResponse.rewrite(url);
  }

  if (request.method === "POST" && request.nextUrl.pathname === "/sell/rain") {
    const url = request.nextUrl.clone();
    url.pathname = "/sell/rain/write";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sell/taken", "/pickup/here", "/cart/shake", "/sell/rain"],
};
