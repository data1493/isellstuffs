import type { Metadata } from "next";
import { cookies } from "next/headers";

import { OrderIndexView } from "@/components/orders/order-views";
import { CHECKOUT_COOKIE } from "@/lib/checkout";
import { orderSlipFromCheckoutCookie } from "@/lib/order-history";
import { ordersPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Order slips",
  description:
    "Stand-in receipts from the last paid tote in this browser. Reconstructed from checkout listing ids. No account. No database.",
  path: ordersPath(),
  robots: { index: false, follow: false },
});

export default async function OrdersPage() {
  const jar = await cookies();
  const seed = orderSlipFromCheckoutCookie(jar.get(CHECKOUT_COOKIE)?.value);

  return <OrderIndexView seed={seed} />;
}
