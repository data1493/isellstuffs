import type { Metadata } from "next";
import { cookies } from "next/headers";

import { QueueView } from "@/components/sell/queue-board";
import { CHECKOUT_COOKIE } from "@/lib/checkout";
import { orderSlipFromCheckoutCookie } from "@/lib/order-history";
import { sellDeskQueuePath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = shareMetadata({
  title: "Who is coming up the drive",
  description:
    "Paid physical lines waiting at a booth. Hours hang on the stall. Files stay in the folder. The mall does not ship.",
  path: sellDeskQueuePath(),
  robots: { index: false, follow: false },
});

export default async function SellDeskQueuePage() {
  const jar = await cookies();
  const seed = orderSlipFromCheckoutCookie(jar.get(CHECKOUT_COOKIE)?.value);

  return <QueueView seed={seed} />;
}
