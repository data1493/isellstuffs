import type { Metadata } from "next";
import { cookies } from "next/headers";

import { ShakeDesk } from "@/app/cart/shake/shake-desk";
import { CART_COOKIE_NAME, CART_MIRROR_SCRIPT, parseCartListingIds } from "@/lib/cart";
import { shakeCartListingIds, type ShakeNotice } from "@/lib/cart-shake";
import { cartShakePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = shareMetadata({
  title: "Shake the tote",
  description:
    "Drop sold chairs, packed leftovers, and ghost ids after a fat bag. What is still here stays. Same tote cookie. Not checkout.",
  path: cartShakePath(),
  robots: { index: false, follow: false },
});

function readNotice(value?: string): ShakeNotice | undefined {
  if (value === "dropped" || value === "clean" || value === "empty") {
    return value;
  }
  return undefined;
}

export default async function CartShakePage({
  searchParams,
}: {
  searchParams: Promise<{ shook?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.shook) ? params.shook[0] : params.shook;
  const notice = readNotice(raw);
  const jar = await cookies();
  const result = shakeCartListingIds(
    parseCartListingIds(jar.get(CART_COOKIE_NAME)?.value),
  );

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: CART_MIRROR_SCRIPT }} />
      <ShakeDesk kept={result.kept} dropped={result.dropped} notice={notice} />
    </>
  );
}
