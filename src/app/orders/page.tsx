import type { Metadata } from "next";
import { cookies } from "next/headers";

import { OrderIndexView } from "@/components/orders/order-views";
import { CHECKOUT_COOKIE } from "@/lib/checkout";
import { orderSlipFromCheckoutCookie } from "@/lib/order-history";
import { ordersMetadata } from "@/lib/seo";

export const metadata: Metadata = ordersMetadata();

export default async function OrdersPage() {
  const jar = await cookies();
  const seed = orderSlipFromCheckoutCookie(jar.get(CHECKOUT_COOKIE)?.value);

  return <OrderIndexView seed={seed} />;
}
