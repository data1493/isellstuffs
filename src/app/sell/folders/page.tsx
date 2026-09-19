import type { Metadata } from "next";
import { cookies } from "next/headers";

import { FolderTapeView } from "@/components/sell/folder-tape";
import { CHECKOUT_COOKIE } from "@/lib/checkout";
import { orderSlipFromCheckoutCookie } from "@/lib/order-history";
import { sellFoldersPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = shareMetadata({
  title: "What walked into a folder",
  description:
    "Paid files from slips in this browser, grouped by booth. Codes stay at the gift desk. Lamps stay on the driveway.",
  path: sellFoldersPath(),
  robots: { index: false, follow: false },
});

export default async function SellFoldersPage() {
  const jar = await cookies();
  const seed = orderSlipFromCheckoutCookie(jar.get(CHECKOUT_COOKIE)?.value);

  return <FolderTapeView seed={seed} />;
}
