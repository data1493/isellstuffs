import type { Metadata } from "next";
import { cookies } from "next/headers";

import { OrderEmailView } from "@/components/orders/order-email";
import { CHECKOUT_COOKIE } from "@/lib/checkout";
import { orderSlipFromCheckoutCookie } from "@/lib/order-history";
import { orderEmailPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return shareMetadata({
    title: "Printed receipt email",
    description:
      "A paper copy of the stand-in order slip. Same tote lines. Nothing was sent.",
    path: orderEmailPath(id),
    robots: { index: false, follow: false },
  });
}

export default async function OrderEmailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const jar = await cookies();
  const seed = orderSlipFromCheckoutCookie(jar.get(CHECKOUT_COOKIE)?.value, id);

  return <OrderEmailView orderId={id} seed={seed} />;
}
