import type { Metadata } from "next";

import { CartView } from "@/app/cart/cart-view";
import { cartMetadata } from "@/lib/seo";

export const metadata: Metadata = cartMetadata();

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string | string[] }>;
}) {
  const params = await searchParams;
  const add = Array.isArray(params.add) ? params.add[0] : params.add;

  return <CartView initialAdd={add} />;
}
