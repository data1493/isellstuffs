import type { Metadata } from "next";
import { cookies } from "next/headers";

import { NoShowView } from "@/components/sell/no-show-board";
import { CHECKOUT_COOKIE } from "@/lib/checkout";
import {
  NO_SHOW_COOKIE_NAME,
  parseNoShowHandoffs,
} from "@/lib/no-show-handoff";
import { orderSlipFromCheckoutCookie } from "@/lib/order-history";
import { sellNoShowPath } from "@/lib/paths";
import { shareMetadata } from "@/lib/seo";
import {
  parseTakenHandoffs,
  TAKEN_COOKIE_NAME,
} from "@/lib/taken-handoff";

export const dynamic = "force-dynamic";

export const metadata: Metadata = shareMetadata({
  title: "They never showed",
  description:
    "After the pickup window, put the lamp back on the floor. Not a refund. The slip stays. Files stay in the folder.",
  path: sellNoShowPath(),
  robots: { index: false, follow: false },
});

export default async function SellNoShowPage() {
  const jar = await cookies();
  const seed = orderSlipFromCheckoutCookie(jar.get(CHECKOUT_COOKIE)?.value);
  const takenSeed = parseTakenHandoffs(jar.get(TAKEN_COOKIE_NAME)?.value);
  const noShowSeed = parseNoShowHandoffs(jar.get(NO_SHOW_COOKIE_NAME)?.value);

  return (
    <NoShowView
      seed={seed}
      takenSeed={takenSeed}
      noShowSeed={noShowSeed}
    />
  );
}
