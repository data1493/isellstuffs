import type { Metadata } from "next";
import { cookies } from "next/headers";

import { TakenView } from "@/components/sell/taken-board";
import { CHECKOUT_COOKIE } from "@/lib/checkout";
import { orderSlipFromCheckoutCookie } from "@/lib/order-history";
import { sellTakenPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";
import {
  parseTakenHandoffs,
  TAKEN_COOKIE_NAME,
} from "@/lib/taken-handoff";

export const dynamic = "force-dynamic";

export const metadata: Metadata = shareMetadata({
  title: "Who left with it",
  description:
    "Close a driveway handoff when the buyer walked. Not a refund. Not a sold sticker. Files stay in the folder.",
  path: sellTakenPath(),
  robots: { index: false, follow: false },
});

export default async function SellTakenPage() {
  const jar = await cookies();
  const seed = orderSlipFromCheckoutCookie(jar.get(CHECKOUT_COOKIE)?.value);
  const takenSeed = parseTakenHandoffs(jar.get(TAKEN_COOKIE_NAME)?.value);

  return <TakenView seed={seed} takenSeed={takenSeed} />;
}
