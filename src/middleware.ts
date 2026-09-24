import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

const POST_KEEP = new Set([
  "/agents/write",
  "/agents/talk/write",
  "/agents/trade",
]);

const MALL = [
  "/about",
  "/advertise",
  "/api",
  "/browse",
  "/campaigns",
  "/cart",
  "/checkout",
  "/collections",
  "/explore",
  "/fees",
  "/folder",
  "/gift",
  "/help",
  "/hubs",
  "/listings",
  "/lot",
  "/orders",
  "/pickup",
  "/rain",
  "/saved",
  "/search",
  "/sell",
  "/stalls",
  "/this-week",
  "/tote",
  "/walk",
  "/wanted",
  "/watched",
];

function isProduct(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/chat" ||
    pathname.startsWith("/chat/") ||
    pathname === "/trade" ||
    pathname.startsWith("/trade/") ||
    pathname === "/donate" ||
    pathname.startsWith("/donate/")
  );
}

function isMall(pathname: string) {
  return MALL.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function agentTarget(pathname: string) {
  if (pathname === "/agents" || pathname === "/agents/") return "/trade";
  if (pathname === "/agents/talk" || pathname.startsWith("/agents/talk/")) {
    return "/chat";
  }
  if (pathname === "/agents/write" || pathname === "/agents/trade") {
    return "/trade";
  }
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "agents") return null;
  if (parts.length === 2) return `/trade/${parts[1]}`;
  return "/trade";
}

function go(request: NextRequest, pathname: string, keepSearch: boolean) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  if (!keepSearch) url.search = "";
  return NextResponse.redirect(url, 308);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === "POST" && POST_KEEP.has(pathname)) {
    return NextResponse.next();
  }

  if (isProduct(pathname)) {
    return NextResponse.next();
  }

  const agent = agentTarget(pathname);
  if (agent) {
    return go(request, agent, true);
  }

  if (isMall(pathname)) {
    return go(request, "/", false);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
