import type { Metadata } from "next";

import { CartView } from "@/app/cart/cart-view";

export const metadata: Metadata = {
  title: "Your tote",
  description: "Pay the mall. Stalls keep their cut after a test checkout.",
};

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string | string[] }>;
}) {
  const params = await searchParams;
  const add = Array.isArray(params.add) ? params.add[0] : params.add;

  return <CartView initialAdd={add} />;
}
