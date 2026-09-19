import type { Metadata } from "next";
import { cookies } from "next/headers";

import { CartView } from "@/app/cart/cart-view";
import { CART_COOKIE_NAME, CART_STORAGE_KEY, parseCartListingIds } from "@/lib/cart";
import { cartMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = cartMetadata();

const syncScript = `try{var m=document.cookie.match(/(?:^|; )${CART_COOKIE_NAME}=([^;]*)/);if(m){localStorage.setItem(${JSON.stringify(CART_STORAGE_KEY)},decodeURIComponent(m[1]));}}catch(e){}`;

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
      <script dangerouslySetInnerHTML={{ __html: syncScript }} />
      <CartView initialAdd={add} initialListingIds={initialListingIds} />
    </>
  );
}
