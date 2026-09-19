import type { Metadata } from "next";
import { cookies } from "next/headers";

import { CartView } from "@/app/cart/cart-view";
import { CART_COOKIE_NAME, CART_MIRROR_SCRIPT, parseCartListingIds } from "@/lib/cart";
import { cartMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = cartMetadata();

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string | string[] }>;
}) {
  const params = await searchParams;
  const add = Array.isArray(params.add) ? params.add[0] : params.add;
  const jar = await cookies();
  const initialListingIds = parseCartListingIds(jar.get(CART_COOKIE_NAME)?.value);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: CART_MIRROR_SCRIPT }} />
      <CartView initialAdd={add} initialListingIds={initialListingIds} />
    </>
  );
}
