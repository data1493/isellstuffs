import type { NextRequest } from "next/server";

/**
 * Redirects stay on the host that received the request.
 * Origin, Referer, and X-Forwarded-Host are client-controlled and are not a host.
 */
export function sameOriginUrl(request: NextRequest, path: string) {
  const base = request.nextUrl.origin;
  const url = new URL(path, `${base}/`);
  if (url.origin !== base) return new URL("/", `${base}/`);
  return url;
}
