import type { Metadata } from "next";
import { cookies } from "next/headers";

import { OrderSlipView } from "@/components/orders/order-views";
import { CHECKOUT_COOKIE } from "@/lib/checkout";
import { orderSlipFromCheckoutCookie } from "@/lib/order-history";
import { orderPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return shareMetadata({
    title: "Order slip",
    description:
      "Stand-in receipt reconstructed from the listing ids on a paid tote. Not a warehouse invoice.",
    path: orderPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function OrderSlipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const jar = await cookies();
  const seed = orderSlipFromCheckoutCookie(jar.get(CHECKOUT_COOKIE)?.value, id);

  return <OrderSlipView orderId={id} seed={seed} />;
}
