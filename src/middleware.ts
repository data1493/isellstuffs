import { NextResponse, type NextRequest } from "next/server";

/** GET /sell/taken is the page. POST /sell/taken writes the scribble. */
export function middleware(request: NextRequest) {
  if (request.method === "POST" && request.nextUrl.pathname === "/sell/taken") {
    const url = request.nextUrl.clone();
    url.pathname = "/sell/taken/write";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/sell/taken",
};
