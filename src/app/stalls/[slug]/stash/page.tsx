import type { Metadata } from "next";
import { cookies } from "next/headers";

import { PaidStashView } from "@/components/stalls/paid-stash-view";
import { CHECKOUT_COOKIE } from "@/lib/checkout";
import { orderSlipFromCheckoutCookie } from "@/lib/order-history";
import { stallStashPath } from "@/lib/paths";
import { clipPaidStashSeed, paidStashForSlug } from "@/lib/paid-stash";
import { missingStallMetadata, shareMetadata } from "@/lib/seo";
import {
  parseTakenHandoffs,
  TAKEN_COOKIE_NAME,
} from "@/lib/taken-handoff";

export const dynamic = "force-dynamic";

type StashPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: StashPageProps): Promise<Metadata> {
  const { slug } = await params;
  const jar = await cookies();
  const rawSeed = orderSlipFromCheckoutCookie(jar.get(CHECKOUT_COOKIE)?.value);
  const taken = parseTakenHandoffs(jar.get(TAKEN_COOKIE_NAME)?.value);
  const seed = clipPaidStashSeed(rawSeed, slug);
  const sheet = paidStashForSlug(slug, seed ? [seed] : [], taken);

  if (sheet.kind === "missing" || !sheet.stall) {
    return missingStallMetadata();
  }

  if (sheet.kind === "empty") {
    return shareMetadata({
      title: `No stash · ${sheet.stall.boothName}`,
      description:
        "Nothing in the stash. Still-here stays on the table tape. Paid lamps sit here until they walk.",
      path: stallStashPath(sheet.stall.slug),
      robots: { index: false, follow: false },
    });
  }

  const titles = sheet.rows.map((row) => row.title).join(", ");

  return shareMetadata({
    title: `Paid stash · ${sheet.stall.boothName}`,
    description: `Paid, not taken at ${sheet.stall.boothName}. ${titles}. Don’t bag. Not the table tape.`,
    path: stallStashPath(sheet.stall.slug),
    robots: { index: false, follow: false },
  });
}

export default async function StallStashPage({ params }: StashPageProps) {
  const { slug } = await params;
  const jar = await cookies();
  const seed = clipPaidStashSeed(
    orderSlipFromCheckoutCookie(jar.get(CHECKOUT_COOKIE)?.value),
    slug,
  );
  const takenSeed = parseTakenHandoffs(jar.get(TAKEN_COOKIE_NAME)?.value);

  return (
    <PaidStashView slug={slug} seed={seed} takenSeed={takenSeed} />
  );
}
